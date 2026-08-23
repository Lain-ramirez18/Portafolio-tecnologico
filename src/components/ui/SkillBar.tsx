import type { CSSProperties } from 'react';
import { useIntersectionOnce } from '../../hooks/useIntersectionOnce';
import type { SkillBarItem } from '../../data/skills';

type SkillFillStyle = CSSProperties & { '--pct': string };

export function SkillBar({ icon, name, pct }: SkillBarItem) {
  const { ref, inView } = useIntersectionOnce<HTMLDivElement>(0.4);

  return (
    <div className="skill-item">
      <div className="skill-icon">
        <i className={icon} aria-hidden="true" />
      </div>
      <div className="skill-info">
        <span className="skill-name">{name}</span>
        <div
          className="skill-bar"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${name} ${pct}%`}
        >
          <div
            className={`skill-fill${inView ? ' animate' : ''}`}
            style={{ '--pct': `${pct}%` } as SkillFillStyle}
            ref={ref}
          />
        </div>
      </div>
    </div>
  );
}
