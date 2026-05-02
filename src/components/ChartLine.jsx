import React, { useRef, useEffect, useContext } from 'react';
import { useTheme } from '../context/ThemeContext';

const ChartLine = ({ 
  className = '', 
  data = [120, 450, 890, 340], 
  labels = ['12am', '8am', '4pm', '11pm'],
  height = 160,
  color 
}) => {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();
  const gradientStart = color || (isDark ? '#A5B4FC' : '#3B82F6');
  const gradientEnd = color ? `${color}20` : (isDark ? '#C7D2FE' : '#8B5CF6');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = height;

    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - padding - 20;
    const maxData = Math.max(...data, 1000);

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(padding, padding + (chartHeight / 4) * i);
      ctx.lineTo(canvas.width - padding, padding + (chartHeight / 4) * i);
      ctx.stroke();
    }

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height);
    gradient.addColorStop(0, gradientStart + '20');
    gradient.addColorStop(1, 'transparent');

    // Scale data
    const points = data.map((val, i) => ({
      x: padding + (i / (data.length - 1)) * chartWidth,
      y: padding + chartHeight - (val / maxData) * chartHeight
    }));

    // Area fill
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, canvas.height);
    ctx.lineTo(points[0].x, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = gradientStart;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dots
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = gradientStart;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // X labels
    ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    labels.forEach((label, i) => {
      ctx.fillText(label, points[i].x, canvas.height - 20);
    });

  }, [data, labels, height, isDark, gradientStart, gradientEnd]);

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      // Trigger re-render via effect deps
      canvas.dispatchEvent(new Event('resize'));
    });
    resizeObserver.observe(canvas.parentElement);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className={`w-full ${className}`}
      style={{ height: `${height}px` }}
    />
  );
};

export default ChartLine;
