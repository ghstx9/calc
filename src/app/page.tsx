'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function CalculatorPage() {
  const [displayValue, setDisplayValue] = useState('0');
  const [firstOperand, setFirstOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForSecondOperand) {
      setDisplayValue(String(digit));
      setWaitingForSecondOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? String(digit) : displayValue + digit);
    }
  };
  
  const inputDecimal = () => {
    if (waitingForSecondOperand) {
        setDisplayValue('0.');
        setWaitingForSecondOperand(false);
        return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const handleOperator = (nextOperator) => {
    const inputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) {
      setOperator(nextOperator);
      return;
    }

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = performCalculation();

      if (!isFinite(result)) {
        setDisplayValue("Error");
      } else {
        setDisplayValue(String(result));
      }
      setFirstOperand(result);
    }

    if (nextOperator === '=') {
        setFirstOperand(null);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };


  const performCalculation = () => {
    const inputValue = parseFloat(displayValue);
    if (firstOperand == null || operator == null) return inputValue;
    
    const calculations = {
      '/': (first, second) => first / second,
      '*': (first, second) => first * second,
      '+': (first, second) => first + second,
      '-': (first, second) => first - second,
      '=': (first, second) => second,
    };

    return calculations[operator](firstOperand, inputValue);
  };
  

  const clearAll = () => {
    setDisplayValue('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };


  const toggleSign = () => {
    const currentValue = parseFloat(displayValue);
    if (currentValue === 0) return;
    setDisplayValue(String(currentValue * -1));
  };
  

  const inputPercent = () => {
    const currentValue = parseFloat(displayValue);
    if (currentValue === 0) return;
    setDisplayValue(String(currentValue / 100));
  };


  return (
    <main className="bg-black min-h-screen flex items-end">
      <div className="w-full max-w-md mx-auto p-4 space-y-4">
        {/* display */}
        <div className="bg-black text-white text-right p-4 rounded-lg">
           <h1 className="font-light text-6xl md:text-8xl break-words min-h-[72px] md:min-h-[96px] flex items-end justify-end">
             {displayValue}
           </h1>
        </div>

        {/* btn grid */}
        <div className="grid grid-cols-4 gap-3">
          {/* row 1 */}
          <Button onClick={clearAll} className="h-20 text-3xl font-semibold rounded-full bg-gray-400 text-black hover:bg-gray-300">AC</Button>
          <Button onClick={toggleSign} className="h-20 text-3xl font-semibold rounded-full bg-gray-400 text-black hover:bg-gray-300">+/-</Button>
          <Button onClick={inputPercent} className="h-20 text-3xl font-semibold rounded-full bg-gray-400 text-black hover:bg-gray-300">%</Button>
          <Button onClick={() => handleOperator('/')} className="h-20 text-3xl font-semibold rounded-full bg-yellow-500 text-white hover:bg-yellow-400">÷</Button>

          {/* row 2 */}
          <Button onClick={() => inputDigit(7)} className="h-20 text-3xl font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600">7</Button>
          <Button onClick={() => inputDigit(8)} className="h-20 text-3xl font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600">8</Button>
          <Button onClick={() => inputDigit(9)} className="h-20 text-3xl font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600">9</Button>
          <Button onClick={() => handleOperator('*')} className="h-20 text-3xl font-semibold rounded-full bg-yellow-500 text-white hover:bg-yellow-400">×</Button>

          {/* row 3 */}
          <Button onClick={() => inputDigit(4)} className="h-20 text-3xl font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600">4</Button>
          <Button onClick={() => inputDigit(5)} className="h-20 text-3xl font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600">5</Button>
          <Button onClick={() => inputDigit(6)} className="h-20 text-3xl font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600">6</Button>
          <Button onClick={() => handleOperator('-')} className="h-20 text-3xl font-semibold rounded-full bg-yellow-500 text-white hover:bg-yellow-400">-</Button>

          {/* row 4 */}
          <Button onClick={() => inputDigit(1)} className="h-20 text-3xl font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600">1</Button>
          <Button onClick={() => inputDigit(2)} className="h-20 text-3xl font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600">2</Button>
          <Button onClick={() => inputDigit(3)} className="h-20 text-3xl font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600">3</Button>
          <Button onClick={() => handleOperator('+')} className="h-20 text-3xl font-semibold rounded-full bg-yellow-500 text-white hover:bg-yellow-400">+</Button>
          
          {/* row 5 */}
          <div className="col-span-2">
            <Button onClick={() => inputDigit(0)} className="h-20 w-full justify-start pl-8 text-3xl font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600">0</Button>
          </div>
          <Button onClick={inputDecimal} className="h-20 text-3xl font-semibold rounded-full bg-gray-700 text-white hover:bg-gray-600">.</Button>
          <Button onClick={() => handleOperator('=')} className="h-20 text-3xl font-semibold rounded-full bg-yellow-500 text-white hover:bg-yellow-400">=</Button>
        </div>
      </div>
    </main>
  );
}
