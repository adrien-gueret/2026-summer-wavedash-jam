import { useCallback, useLayoutEffect, useRef, useState } from "react";

import FamilyBranch from "@/components/FamilyBranch";
import FamilyTreeNode from "@/components/FamilyTreeNode";
import { CHARACTERS } from "@/data/characters";
import { FAMILY_TREE } from "@/data/familyTree";
import type { CharacterId } from "@/types";

import "./style.css";

type FamilyTreeProps = {
  selectedCharacterId: CharacterId | null;
  onSelect: (characterId: CharacterId) => void;
};

const GRANDPARENTS = FAMILY_TREE.partnerRelationships[0];
const GRANDPARENT_CHILDREN = new Set(
  FAMILY_TREE.parentChildRelationships.find(
    (entry) =>
      entry.parentIds.includes(GRANDPARENTS.firstCharacterId) &&
      entry.parentIds.includes(GRANDPARENTS.secondCharacterId),
  )?.childIds ?? [],
);

/**
 * The three second-generation branches, in birth order of Martha and Henry's
 * children. Each entry is derived from the shared family-tree data.
 */
const SECOND_GENERATION = FAMILY_TREE.partnerRelationships
  .slice(1)
  .map((relationship) => {
    const parentRelationship = FAMILY_TREE.parentChildRelationships.find(
      (entry) =>
        entry.parentIds.includes(relationship.firstCharacterId) &&
        entry.parentIds.includes(relationship.secondCharacterId),
    );

    return {
      relationship,
      childIds: parentRelationship ? parentRelationship.childIds : [],
    };
  });

/** Positions of a rendered node, relative to the tree's coordinate space. */
type NodeRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  cx: number;
  cy: number;
};

/** A single axis-aligned connector segment in tree coordinates. */
type Segment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export default function FamilyTree({
  selectedCharacterId,
  onSelect,
}: FamilyTreeProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<CharacterId, HTMLElement>>(new Map());
  const [segments, setSegments] = useState<Segment[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const registerNode = useCallback(
    (characterId: CharacterId, element: HTMLElement | null) => {
      if (element) {
        nodeRefs.current.set(characterId, element);
      } else {
        nodeRefs.current.delete(characterId);
      }
    },
    [],
  );

  const measure = useCallback(() => {
    const container = innerRef.current;
    if (!container) {
      return;
    }

    const origin = container.getBoundingClientRect();
    const rectOf = (id: CharacterId): NodeRect | null => {
      const element = nodeRefs.current.get(id);
      if (!element) {
        return null;
      }
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left - origin.left,
        top: rect.top - origin.top,
        right: rect.right - origin.left,
        bottom: rect.bottom - origin.top,
        cx: rect.left + rect.width / 2 - origin.left,
        cy: rect.top + rect.height / 2 - origin.top,
      };
    };

    const segs: Segment[] = [];

    // Grandparents couple line.
    const grand1 = rectOf(GRANDPARENTS.firstCharacterId);
    const grand2 = rectOf(GRANDPARENTS.secondCharacterId);
    let grandCoupleY = 0;
    let grandCenterX = 0;
    let grandBottom = 0;
    const hasGrandparents = grand1 !== null && grand2 !== null;
    if (grand1 && grand2) {
      grandCoupleY = (grand1.cy + grand2.cy) / 2;
      grandCenterX = (grand1.cx + grand2.cx) / 2;
      grandBottom = Math.max(grand1.bottom, grand2.bottom);
      segs.push({
        x1: grand1.cx,
        y1: grandCoupleY,
        x2: grand2.cx,
        y2: grandCoupleY,
      });
    }

    // Measure each second-generation branch couple.
    const branches = SECOND_GENERATION.map(({ relationship, childIds }) => {
      const first = rectOf(relationship.firstCharacterId);
      const second = rectOf(relationship.secondCharacterId);
      if (!first || !second) {
        return null;
      }
      const parentX = GRANDPARENT_CHILDREN.has(relationship.firstCharacterId)
        ? first.cx
        : second.cx;
      return {
        centerX: (first.cx + second.cx) / 2,
        parentX,
        coupleY: (first.cy + second.cy) / 2,
        top: Math.min(first.top, second.top),
        bottom: Math.max(first.bottom, second.bottom),
        firstCenterX: first.cx,
        secondCenterX: second.cx,
        childIds,
      };
    }).filter(
      (branch): branch is NonNullable<typeof branch> => branch !== null,
    );

    // Trunk from the grandparents down to a horizontal bus feeding each branch.
    if (hasGrandparents && branches.length > 0) {
      const branchTop = Math.min(...branches.map((branch) => branch.top));
      const busY = (grandBottom + branchTop) / 2;
      const centers = branches.map((branch) => branch.parentX);
      const minX = Math.min(grandCenterX, ...centers);
      const maxX = Math.max(grandCenterX, ...centers);

      segs.push({ x1: minX, y1: busY, x2: maxX, y2: busY });
      segs.push({
        x1: grandCenterX,
        y1: grandCoupleY,
        x2: grandCenterX,
        y2: busY,
      });
      branches.forEach((branch) => {
        segs.push({
          x1: branch.parentX,
          y1: busY,
          x2: branch.parentX,
          y2: branch.coupleY,
        });
      });
    }

    // Each branch: couple line plus the connectors down to its children.
    branches.forEach((branch) => {
      segs.push({
        x1: branch.firstCenterX,
        y1: branch.coupleY,
        x2: branch.secondCenterX,
        y2: branch.coupleY,
      });

      const childRects = branch.childIds
        .map(rectOf)
        .filter((rect): rect is NodeRect => rect !== null);
      if (childRects.length === 0) {
        return;
      }

      const childTop = Math.min(...childRects.map((rect) => rect.top));
      const childBusY = (branch.bottom + childTop) / 2;
      const centers = childRects.map((rect) => rect.cx);
      const minX = Math.min(...centers);
      const maxX = Math.max(...centers);
      const childrenCenterX = (minX + maxX) / 2;

      segs.push({
        x1: childrenCenterX,
        y1: branch.coupleY,
        x2: childrenCenterX,
        y2: childBusY,
      });
      if (maxX - minX > 0.5) {
        segs.push({ x1: minX, y1: childBusY, x2: maxX, y2: childBusY });
      }
      childRects.forEach((rect) => {
        segs.push({ x1: rect.cx, y1: childBusY, x2: rect.cx, y2: rect.top });
      });
    });

    setSize({ width: container.scrollWidth, height: container.scrollHeight });
    // Snap every endpoint to the half-pixel grid. With a 3px (odd) stroke this
    // keeps each edge on a whole pixel, so lines stay crisp without
    // `crispEdges` and — because both axes are snapped consistently — corners
    // and T-junctions meet exactly. Horizontal segments are then extended by
    // half the stroke width at each end so L-corners fill in flush (the extra
    // length only ever runs into a perpendicular line or hides behind a card).
    const snap = (value: number) => Math.round(value) + 0.5;
    const halfStroke = 1.5;
    const snapped = segs.map((segment) => {
      if (Math.abs(segment.x1 - segment.x2) < 0.5) {
        const x = snap(segment.x1);
        return {
          ...segment,
          x1: x,
          x2: x,
          y1: snap(segment.y1),
          y2: snap(segment.y2),
        };
      }
      if (Math.abs(segment.y1 - segment.y2) < 0.5) {
        const y = snap(segment.y1);
        const minX = snap(Math.min(segment.x1, segment.x2)) - halfStroke;
        const maxX = snap(Math.max(segment.x1, segment.x2)) + halfStroke;
        return { ...segment, x1: minX, x2: maxX, y1: y, y2: y };
      }
      return segment;
    });
    setSegments(snapped);
  }, []);

  useLayoutEffect(() => {
    measure();

    const container = innerRef.current;
    const observer = new ResizeObserver(() => measure());
    if (container) {
      observer.observe(container);
    }
    window.addEventListener("resize", measure);

    let cancelled = false;
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) {
          measure();
        }
      });
    }

    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <div className="family-tree">
      <div className="family-tree__scroll">
        <div className="family-tree__inner" ref={innerRef}>
          <svg
            className="family-tree__connectors"
            width={size.width}
            height={size.height}
            viewBox={`0 0 ${size.width} ${size.height}`}
            aria-hidden="true"
            focusable="false"
          >
            {segments.map((segment, index) => (
              <line
                key={index}
                x1={segment.x1}
                y1={segment.y1}
                x2={segment.x2}
                y2={segment.y2}
              />
            ))}
          </svg>

          <section
            className="family-tree__grandparents"
            aria-label="Grandparents"
          >
            <FamilyTreeNode
              character={CHARACTERS[GRANDPARENTS.firstCharacterId]}
              isSelected={selectedCharacterId === GRANDPARENTS.firstCharacterId}
              relationLabel={
                CHARACTERS[GRANDPARENTS.firstCharacterId].familyRole
              }
              onSelect={onSelect}
              registerNode={registerNode}
            />
            <span className="family-tree__couple-gap" aria-hidden="true" />
            <FamilyTreeNode
              character={CHARACTERS[GRANDPARENTS.secondCharacterId]}
              isSelected={
                selectedCharacterId === GRANDPARENTS.secondCharacterId
              }
              relationLabel={
                CHARACTERS[GRANDPARENTS.secondCharacterId].familyRole
              }
              onSelect={onSelect}
              registerNode={registerNode}
            />
          </section>

          <span className="family-tree__trunk" aria-hidden="true" />

          <div className="family-tree__branches">
            {SECOND_GENERATION.map(({ relationship, childIds }) => (
              <div
                key={relationship.firstCharacterId}
                className="family-tree__branch-slot"
              >
                <FamilyBranch
                  partnerIds={[
                    relationship.firstCharacterId,
                    relationship.secondCharacterId,
                  ]}
                  partnerStatus={relationship.status}
                  childIds={childIds}
                  heading={`${CHARACTERS[relationship.firstCharacterId].displayName} and ${CHARACTERS[relationship.secondCharacterId].displayName}`}
                  selectedCharacterId={selectedCharacterId}
                  onSelect={onSelect}
                  registerNode={registerNode}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="family-tree__hint" aria-hidden="true">
        Swipe to explore the family tree
      </p>
    </div>
  );
}
