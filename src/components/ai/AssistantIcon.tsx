import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

/** A compact AI chip, matching the supplied reference without raster scaling. */
export function AssistantIcon({size=22,color}:{size?:number;color:string}) {
  const pins=[17,24,31];
  return <Svg width={size} height={size} viewBox="0 0 48 48" accessible={false} testID="assistant-ai-chip-icon">
    <Path d="M17 5V11 M24 3V11 M31 5V11 M17 37V43 M24 37V45 M31 37V43 M5 17H11 M3 24H11 M5 31H11 M37 17H43 M37 24H45 M37 31H43" stroke={color} strokeWidth={2} strokeLinecap="round" />
    {pins.map((p,i)=><React.Fragment key={p}>
      <Circle cx={p} cy={i===1?3:5} r={1.5} fill={color}/>
      <Circle cx={p} cy={i===1?45:43} r={1.5} fill={color}/>
      <Circle cx={i===1?3:5} cy={p} r={1.5} fill={color}/>
      <Circle cx={i===1?45:43} cy={p} r={1.5} fill={color}/>
    </React.Fragment>)}
    <Rect x={11} y={11} width={26} height={26} rx={5} fill="none" stroke={color} strokeWidth={2.2}/>
    <Path d="M15.5 31L20.5 17H22.5L27.5 31H24.8L23.5 27H19.5L18.2 31Z M20.2 24.8H22.8L21.5 20.3Z" fill={color} fillRule="evenodd"/>
    <Path d="M29 17H31.6V31H29Z" fill={color}/>
  </Svg>;
}
