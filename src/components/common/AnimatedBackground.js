import React from 'react';
import styled, { keyframes } from 'styled-components';

const float = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(20px) rotate(5deg); }
  100% { transform: translateY(0) rotate(0deg); }
`;

const floatReverse = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(-5deg); }
  100% { transform: translateY(0) rotate(0deg); }
`;

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
`;

const Shape = styled.div`
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
  animation-duration: 10s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
`;

const Circle1 = styled(Shape)`
  width: 300px;
  height: 300px;
  background-color: ${props => props.theme.colors.primary};
  top: -150px;
  left: -150px;
  animation-name: ${float};
`;

const Circle2 = styled(Shape)`
  width: 200px;
  height: 200px;
  background-color: ${props => props.theme.colors.secondary};
  bottom: -100px;
  right: -50px;
  animation-name: ${floatReverse};
  animation-delay: 2s;
`;

const Circle3 = styled(Shape)`
  width: 150px;
  height: 150px;
  background-color: ${props => props.theme.colors.primary};
  top: 50%;
  right: -75px;
  animation-name: ${float};
  animation-delay: 3s;
`;

const AnimatedBackground = () => {
  return (
    <Container>
      <Circle1 />
      <Circle2 />
      <Circle3 />
    </Container>
  );
};

export default AnimatedBackground;
