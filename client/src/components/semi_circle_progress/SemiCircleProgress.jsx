import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useScreenWidth } from "../../hooks/useScreenWidth";

const SemiCircleProgress = ({ value = 0, total = 1000 }) => {
  const screenWidth = useScreenWidth();
  const isMobile = screenWidth < 768;

  const innerRadius = isMobile ? 100 : 80;
  const outerRadius = isMobile ? 120 : 100;

  const clampedValue = Math.max(0, Math.min(value, total));
  const progress = total > 0 ? clampedValue / total : 0;

  const RED = [231, 76, 60];
  const ORANGE = [243, 156, 18];
  const GREEN = [39, 174, 96];

  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (c1, c2, t) =>
    `rgb(${Math.round(lerp(c1[0], c2[0], t))},${Math.round(
      lerp(c1[1], c2[1], t)
    )},${Math.round(lerp(c1[2], c2[2], t))})`;

  const getColor = () => {
    if (progress <= 0.5) {
      const t = progress / 0.5;
      return mix(RED, ORANGE, t);
    }
    const t = (progress - 0.5) / 0.5;
    return mix(ORANGE, GREEN, t);
  };

  const dynamicColor = getColor();

  return (
    <div
      className="circle-progress"
      style={{
        position: "relative",
        transform: "rotate(50deg)",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* Фон */}
          <Pie
            data={[{ value: total }]}
            cx="50%"
            cy="50%"
            startAngle={280}
            endAngle={0}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#D7DBDE"
            dataKey="value"
            cornerRadius={60}
          >
            <Cell fill="#D7DBDE" />
          </Pie>

          {/* Прогресс */}
          <Pie
            data={[
              { name: "Progress", value: clampedValue },
              { name: "Remaining", value: total - clampedValue },
            ]}
            cx="50%"
            cy="50%"
            startAngle={280}
            endAngle={0}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            cornerRadius={60}
          >
            <Cell fill={`url(#progressGradient-${value}-${total})`} />
            <Cell fill="transparent" stroke="none" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Градиент */}
      <svg width="0" height="0">
        <defs>
          <linearGradient
            id={`progressGradient-${value}-${total}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
            /* ❗ Исправлено направление градиента */
            gradientTransform="rotate(-40 0.5 0.5)"
          >
            <stop offset="0%" stopColor="#e74c3c" />
            <stop offset="50%" stopColor="#f39c12" />
            <stop offset="100%" stopColor={dynamicColor} />
          </linearGradient>
        </defs>
      </svg>

      {/* Текст */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-50deg)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "36px", fontWeight: "bold" }}>
          {clampedValue}
        </div>
        <div style={{ fontSize: "16px", color: "#666", marginTop: "10px" }}>
          из {total.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default SemiCircleProgress;
