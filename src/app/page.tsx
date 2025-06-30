'use client';

import React, { useReducer, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, History, Sun, Moon, Github } from 'lucide-react';

// --- state and reducer ---

const initialState = {
  displayValue: '0',
  firstOperand: null,
  operator: null,
  waitingForSecondOperand: false,
  history: '',
  calculationHistory: [],
  showHistory: false,
  previousResult: null,
  isDarkMode: true,
};

function reducer(state, action) {
  const { displayValue, firstOperand, operator, waitingForSecondOperand, calculationHistory } = state;
  const inputValue = parseFloat(displayValue);

  const performCalculation = () => {
    if (firstOperand == null || operator == null) return inputValue;
    const calculations = {
      '/': (first, second) => {
        if (second === 0) return NaN;
        return first / second;
      },
      '*': (first, second) => first * second,
      '+': (first, second) => first + second,
      '-': (first, second) => first - second,
    };
    return calculations[operator](firstOperand, inputValue);
  };

  const formatNumber = (num) => {
    if (!isFinite(num)) return 'Error';
    
    if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return num.toExponential(6);
    }
    
    const str = num.toString();
    if (str.length > 15) {
      return parseFloat(num.toPrecision(12)).toString();
    }
    return str;
  };

  switch (action.type) {
    case 'INPUT_DIGIT':
      if (displayValue.length >= 15) return state;
      if (waitingForSecondOperand) {
        return {
          ...state,
          displayValue: String(action.payload),
          waitingForSecondOperand: false,
        };
      }
      return {
        ...state,
        displayValue: displayValue === '0' ? String(action.payload) : displayValue + action.payload,
      };

    case 'INPUT_DECIMAL':
      if (waitingForSecondOperand) {
        return {
          ...state,
          displayValue: '0.',
          waitingForSecondOperand: false,
        };
      }
      if (!displayValue.includes('.')) {
        return {
          ...state,
          displayValue: displayValue + '.',
        };
      }
      return state;

    case 'CHOOSE_OPERATOR': {
      const { payload: nextOperator } = action;
      if (operator && waitingForSecondOperand) {
        return { ...state, operator: nextOperator };
      }

      let newFirstOperand = firstOperand;
      let newDisplayValue = displayValue;

      if (firstOperand === null) {
        newFirstOperand = inputValue;
      } else if (operator) {
        const result = performCalculation();
        if (!isFinite(result)) {
          return {
            ...state,
            displayValue: "Error",
            firstOperand: null,
            operator: null,
            waitingForSecondOperand: false,
            history: '',
          };
        }
        newDisplayValue = formatNumber(result);
        newFirstOperand = result;
      }

      return {
        ...state,
        waitingForSecondOperand: true,
        operator: nextOperator,
        firstOperand: newFirstOperand,
        displayValue: newDisplayValue,
        history: `${formatNumber(newFirstOperand)} ${nextOperator}`,
      };
    }

    case 'CALCULATE': {
      if (operator === null || waitingForSecondOperand) return state;
      const result = performCalculation();
      
      if (!isFinite(result)) {
        return {
          ...state,
          displayValue: "Error",
          firstOperand: null,
          operator: null,
          waitingForSecondOperand: false,
          history: '',
        };
      }
      
      const calculation = `${formatNumber(firstOperand)} ${operator} ${displayValue} = ${formatNumber(result)}`;
      
      return {
        ...state,
        displayValue: formatNumber(result),
        history: calculation,
        previousResult: result,
        calculationHistory: [calculation, ...calculationHistory.slice(0, 19)],
        firstOperand: null,
        operator: null,
        waitingForSecondOperand: false,
      };
    }

    case 'CLEAR':
      return {
        ...state,
        displayValue: '0',
        firstOperand: null,
        operator: null,
        waitingForSecondOperand: false,
        history: '',
      };

    case 'ALL_CLEAR':
      return {
        ...state,
        displayValue: '0',
        firstOperand: null,
        operator: null,
        waitingForSecondOperand: false,
        history: '',
      };

    case 'TOGGLE_SIGN':
      if (displayValue === '0' || displayValue === 'Error') return state;
      return {
        ...state,
        displayValue: displayValue.startsWith('-') 
          ? displayValue.slice(1) 
          : '-' + displayValue,
      };

    case 'INPUT_PERCENT':
      return {
        ...state,
        displayValue: formatNumber(parseFloat(displayValue) / 100),
      };

    case 'BACKSPACE':
      if (displayValue === '0' || displayValue === 'Error' || waitingForSecondOperand) return state;
      const newValue = displayValue.slice(0, -1);
      return {
        ...state,
        displayValue: newValue === '' || newValue === '-' ? '0' : newValue,
      };

    case 'TOGGLE_HISTORY':
      return {
        ...state,
        showHistory: !state.showHistory,
      };

    case 'CLEAR_HISTORY':
      return {
        ...state,
        calculationHistory: [],
      };

    case 'USE_HISTORY_VALUE':
      const historyResult = action.payload.split(' = ')[1];
      return {
        ...state,
        displayValue: historyResult,
        showHistory: false,
      };

    case 'TOGGLE_THEME':
      return {
        ...state,
        isDarkMode: !state.isDarkMode,
      };

    default:
      return state;
  }
}

// --- button layout ---

const getButtonLayout = (isDarkMode) => {
    const lightModeClass = 'bg-black text-white hover:bg-gray-800 active:bg-gray-700';
    const lightModeOperatorClass = 'bg-blue-500 text-white hover:bg-blue-400 active:bg-blue-600';
    const lightModeSpecialClass = 'bg-gray-600 text-white hover:bg-gray-500 active:bg-gray-700';

    return [
        { id: 'clear', text: 'AC', type: 'CLEAR', className: isDarkMode ? 'bg-gray-400 text-black hover:bg-gray-300 active:bg-gray-500' : lightModeSpecialClass },
        { id: 'toggle-sign', text: '+/-', type: 'TOGGLE_SIGN', className: isDarkMode ? 'bg-gray-400 text-black hover:bg-gray-300 active:bg-gray-500' : lightModeSpecialClass },
        { id: 'percent', text: '%', type: 'INPUT_PERCENT', className: isDarkMode ? 'bg-gray-400 text-black hover:bg-gray-300 active:bg-gray-500' : lightModeSpecialClass },
        { id: 'divide', text: '÷', type: 'CHOOSE_OPERATOR', payload: '/', className: isDarkMode ? 'bg-yellow-500 text-white hover:bg-yellow-400 active:bg-yellow-600' : lightModeOperatorClass },
        { id: 'seven', text: '7', type: 'INPUT_DIGIT', payload: 7, className: isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800' : lightModeClass },
        { id: 'eight', text: '8', type: 'INPUT_DIGIT', payload: 8, className: isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800' : lightModeClass },
        { id: 'nine', text: '9', type: 'INPUT_DIGIT', payload: 9, className: isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800' : lightModeClass },
        { id: 'multiply', text: '×', type: 'CHOOSE_OPERATOR', payload: '*', className: isDarkMode ? 'bg-yellow-500 text-white hover:bg-yellow-400 active:bg-yellow-600' : lightModeOperatorClass },
        { id: 'four', text: '4', type: 'INPUT_DIGIT', payload: 4, className: isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800' : lightModeClass },
        { id: 'five', text: '5', type: 'INPUT_DIGIT', payload: 5, className: isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800' : lightModeClass },
        { id: 'six', text: '6', type: 'INPUT_DIGIT', payload: 6, className: isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800' : lightModeClass },
        { id: 'subtract', text: '-', type: 'CHOOSE_OPERATOR', payload: '-', className: isDarkMode ? 'bg-yellow-500 text-white hover:bg-yellow-400 active:bg-yellow-600' : lightModeOperatorClass },
        { id: 'one', text: '1', type: 'INPUT_DIGIT', payload: 1, className: isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800' : lightModeClass },
        { id: 'two', text: '2', type: 'INPUT_DIGIT', payload: 2, className: isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800' : lightModeClass },
        { id: 'three', text: '3', type: 'INPUT_DIGIT', payload: 3, className: isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800' : lightModeClass },
        { id: 'add', text: '+', type: 'CHOOSE_OPERATOR', payload: '+', className: isDarkMode ? 'bg-yellow-500 text-white hover:bg-yellow-400 active:bg-yellow-600' : lightModeOperatorClass },
        { id: 'zero', text: '0', type: 'INPUT_DIGIT', payload: 0, className: `col-span-2 justify-start pl-8 ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800' : lightModeClass}` },
        { id: 'decimal', text: '.', type: 'INPUT_DECIMAL', className: isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800' : lightModeClass },
        { id: 'equals', text: '=', type: 'CALCULATE', className: isDarkMode ? 'bg-yellow-500 text-white hover:bg-yellow-400 active:bg-yellow-600' : lightModeOperatorClass },
    ];
}

export default function CalculatorPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const displayRef = useRef(null);
  const [pressedKey, setPressedKey] = useState(null);

  // --- kb support ---
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      
      setPressedKey(key);
      setTimeout(() => setPressedKey(null), 150);
      
      if (/\d/.test(key)) {
        dispatch({ type: 'INPUT_DIGIT', payload: parseInt(key) });
      } else if (key === '.') {
        dispatch({ type: 'INPUT_DECIMAL' });
      } else if (key === '+' || key === '-') {
        dispatch({ type: 'CHOOSE_OPERATOR', payload: key });
      } else if (key === '*') {
        dispatch({ type: 'CHOOSE_OPERATOR', payload: '*' });
      } else if (key === '/') {
        event.preventDefault(); 
        dispatch({ type: 'CHOOSE_OPERATOR', payload: '/' });
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        dispatch({ type: 'CALCULATE' });
      } else if (key === 'Backspace') {
        dispatch({ type: 'BACKSPACE' });
      } else if (key === 'Escape') {
        dispatch({ type: 'ALL_CLEAR' });
      } else if (key === 'Delete') {
        dispatch({ type: 'CLEAR' });
      } else if (key === '%') {
        dispatch({ type: 'INPUT_PERCENT' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // --- dynamic font size ---
  useEffect(() => {
    const display = displayRef.current;
    if (display) {
      const displayLength = state.displayValue.length;
      let fontSize = '4rem'; 
      if (displayLength > 6) {
        fontSize = '3rem'; 
      }
      if (displayLength > 9) {
        fontSize = '2.5rem'; 
      }
      if (displayLength > 12) {
        fontSize = '2rem';
      }
      if (displayLength > 15) {
        fontSize = '1.5rem';
      }
      display.style.fontSize = fontSize;
    }
  }, [state.displayValue]);

  const getButtonText = () => {
    if (state.displayValue === '0' && state.firstOperand === null && state.history === '') return 'AC';
    return 'C';
  };

  const getButtonClassName = (btn) => {
    let className = btn.className;
    
    if (pressedKey !== null) {
      if ((btn.type === 'INPUT_DIGIT' && pressedKey === btn.payload.toString()) ||
          (btn.type === 'CHOOSE_OPERATOR' && pressedKey === btn.payload) ||
          (btn.type === 'CALCULATE' && (pressedKey === 'Enter' || pressedKey === '=')) ||
          (btn.type === 'INPUT_DECIMAL' && pressedKey === '.') ||
          (btn.type === 'CLEAR' && pressedKey === 'Delete') ||
          (btn.type === 'INPUT_PERCENT' && pressedKey === '%')) {
        className += ' ring-2 ring-white ring-opacity-50';
      }
    }
    
    if (btn.type === 'CHOOSE_OPERATOR' && btn.payload === state.operator && state.waitingForSecondOperand) {
      if (state.isDarkMode) {
        className = className.replace('bg-yellow-500', 'bg-white text-yellow-500');
      } else {
        // When an operator is active in light mode, give it a distinct style
        className = 'bg-white text-blue-500';
      }
    }
    
    return className;
  };

  const buttonLayout = getButtonLayout(state.isDarkMode);

  return (
    <main className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      state.isDarkMode ? 'bg-black' : 'bg-gray-50'
    }`}>
      <div className="w-full max-w-sm mx-auto space-y-4 font-sans">
        {/* recent panel */}
        {state.showHistory && (
          <div className={`rounded-2xl p-4 max-h-64 overflow-y-auto transition-colors duration-300 ${
            state.isDarkMode ? 'bg-gray-900' : 'bg-white border border-gray-200 shadow-lg'
          }`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className={`text-lg font-medium ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                History
              </h3>
              <Button
                onClick={() => dispatch({ type: 'CLEAR_HISTORY' })}
                className={`text-xs px-3 py-1 h-auto transition-colors duration-300 ${
                  state.isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-black hover:bg-gray-800 text-white'
                }`}
              >
                Clear All
              </Button>
            </div>
            {state.calculationHistory.length === 0 ? (
              <p className={`text-center py-4 ${state.isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No calculations yet
              </p>
            ) : (
              <div className="space-y-2">
                {state.calculationHistory.map((calc, index) => (
                  <div
                    key={index}
                    onClick={() => dispatch({ type: 'USE_HISTORY_VALUE', payload: calc })}
                    className={`text-sm p-2 rounded-lg cursor-pointer transition-colors ${
                      state.isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-800' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {calc}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* control buttons */}
        <div className="flex justify-between">
          <Button
            onClick={() => dispatch({ type: 'TOGGLE_HISTORY' })}
            className={`p-3 rounded-full transition-colors duration-300 ${
              state.isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-black hover:bg-gray-800 text-white'
            }`}
          >
            <History size={20} />
          </Button>
          
          <Button
            onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
            className={`p-3 rounded-full transition-colors duration-300 ${
              state.isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-black hover:bg-gray-800 text-white'
            }`}
          >
            {state.isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          
          <Button
            onClick={() => dispatch({ type: 'ALL_CLEAR' })}
            className={`p-3 rounded-full transition-colors duration-300 ${
              state.isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-black hover:bg-gray-800 text-white'
            }`}
          >
            <RotateCcw size={20} />
          </Button>
        </div>

        {/* display */}
        <div className={`text-right space-y-2 rounded-2xl p-6 transition-colors duration-300 ${
          state.isDarkMode 
            ? 'text-white bg-gray-900' 
            : 'text-gray-900 bg-white border border-gray-200 shadow-lg'
        }`}>
          <div className={`font-light h-6 text-lg ${state.isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {state.history}
          </div>
          <div 
            ref={displayRef}
            className="font-light break-words min-h-[80px] flex items-end justify-end transition-all duration-200"
            style={{lineHeight: '1.1'}}
          >
            {state.displayValue}
          </div>
        </div>

        {/* button grid */}
        <div className="grid grid-cols-4 gap-3">
          {buttonLayout.map((btn) => (
            <Button
              key={btn.id}
              onClick={() => dispatch({ type: btn.type, payload: btn.payload })}
              className={`h-20 text-3xl font-semibold rounded-full transition-all duration-150 ${getButtonClassName(btn)}`}
            >
              {btn.id === 'clear' ? getButtonText() : btn.text}
            </Button>
          ))}
        </div>

        {/* keyboard instructions */}
        <div className={`text-xs text-center space-y-1 transition-colors duration-300 ${
          state.isDarkMode ? 'text-gray-600' : 'text-gray-500'
        }`}>
          <p>Keyboard shortcuts: Numbers, operators, Enter/= (calculate)</p>
          <p>Backspace (delete), Delete (clear), Esc (all clear)</p>
        </div>
      </div>

      {/* github on bottom right */}
      <a
        href="https://github.com/ghstx9"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-10"
      >
        <Button
          className={`p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
            state.isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-white shadow-gray-900/50' 
              : 'bg-white hover:bg-gray-50 text-gray-900 shadow-gray-500/20 border border-gray-200'
          }`}
        >
          <Github size={24} />
        </Button>
      </a>
    </main>
  );
}