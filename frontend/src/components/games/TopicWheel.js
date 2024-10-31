import React, { useState, useEffect, useMemo } from 'react';

const TopicWheel = ({ topics = [], onTopicSelected, isSpinning, disabled, onSpin }) => {
  const [rotation, setRotation] = useState(0);
  const [finalRotation, setFinalRotation] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState(null);
  
  const size = 300;
  const center = size / 2;
  const radius = size / 2 - 20;
  
  useEffect(() => {
    if (isSpinning && topics.length > 0) {
      const randomSpins = 4 + Math.random() * 2;
      const targetRotation = randomSpins * 360;
      const segmentSize = 360 / topics.length;
      const selectedIndex = Math.floor(((targetRotation % 360) / segmentSize));
      
      setFinalRotation(targetRotation);
      setSelectedSegment(null);
      
      const startTime = Date.now();
      const duration = 3000;
      
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);
        const currentRotation = targetRotation * easeOut(progress);
        setRotation(currentRotation);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setSelectedSegment(selectedIndex);
          onTopicSelected(topics[selectedIndex]);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isSpinning, topics, onTopicSelected]);

  const textProperties = useMemo(() => {
    const segmentSize = 360 / topics.length;
    const baseFontSize = Math.min(14, 180 / topics.length);
    const textRadius = radius * (segmentSize < 45 ? 0.6 : 0.7);
    return { baseFontSize, textRadius };
  }, [topics.length, radius]);

  if (!topics || topics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No topics available</p>
      </div>
    );
  }
  
  const segmentSize = 360 / topics.length;
  
  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      {/* Selection Indicator Container */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[2px] z-10 flex flex-col items-center">
        {/* Pointer Light */}
        <div className={`w-4 h-4 rounded-full mb-1 transition-colors duration-200 
          ${isSpinning ? 'bg-yellow-400 animate-pulse' : 'bg-red-500'}`} 
        />
        
        {/* Triangle Indicator */}
        <div className="relative">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-red-500 filter drop-shadow-md" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
        </div>
      </div>

      {/* Selection Highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-[150px] pointer-events-none"
           style={{ 
             background: 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
             transform: 'rotate(0deg)',
             transformOrigin: 'bottom',
             display: isSpinning ? 'block' : 'none'
           }} 
      />

      <div className="relative">
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`}
          className="transition-transform duration-[3000ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Outer Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius + 5}
            fill="none"
            stroke="#444"
            strokeWidth="4"
          />

          {/* Wheel segments */}
          {topics.map((topic, i) => {
            const startAngle = i * segmentSize;
            const endAngle = (i + 1) * segmentSize;
            
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (endAngle - 90) * Math.PI / 180;
            
            const x1 = center + radius * Math.cos(startRad);
            const y1 = center + radius * Math.sin(startRad);
            const x2 = center + radius * Math.cos(endRad);
            const y2 = center + radius * Math.sin(endRad);
            
            const largeArcFlag = segmentSize > 180 ? 1 : 0;
            
            const path = [
              `M ${center} ${center}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            const midAngle = (startAngle + endAngle) / 2;
            const midAngleRad = (midAngle - 90) * Math.PI / 180;
            const textX = center + textProperties.textRadius * Math.cos(midAngleRad);
            const textY = center + textProperties.textRadius * Math.sin(midAngleRad);

            let textRotation = midAngle;
            if (textRotation > 90 && textRotation < 270) {
              textRotation += 180;
            }

            const isSelected = selectedSegment === i && !isSpinning;
            
            return (
              <g key={i}>
                <path
                  d={path}
                  fill={`hsl(${(i * 360) / topics.length}, ${isSelected ? '80%' : '70%'}, ${isSelected ? '50%' : '60%'})`}
                  stroke="white"
                  strokeWidth="2"
                  className={isSelected ? 'drop-shadow-lg' : ''}
                />
                
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                  style={{ 
                    fontSize: `${textProperties.baseFontSize}px`,
                    fontWeight: 'bold',
                    filter: isSelected ? 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' : 'none'
                  }}
                >
                  {topic.topicName}
                </text>
              </g>
            );
          })}
          
          {/* Center hub */}
          <g>
            <circle
              cx={center}
              cy={center}
              r="22"
              fill="#444"
              stroke="white"
              strokeWidth="2"
            />
            <circle
              cx={center}
              cy={center}
              r="5"
              fill="white"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default TopicWheel;