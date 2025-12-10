import React from 'react';
import { IeltsWord } from '../types';

interface WordCardProps {
  data: IeltsWord;
  className?: string;
}

const WordCard: React.FC<WordCardProps> = ({ data, className = '' }) => {
  return (
    <div className={`bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-morandi-stone/30 ${className}`}>
      <div className="flex justify-between items-baseline mb-2">
        <h2 className="text-3xl font-bold text-morandi-charcoal">{data.word}</h2>
        <span className="text-morandi-sage font-mono text-sm">{data.pronunciation}</span>
      </div>
      
      <p className="text-lg text-morandi-clay font-medium mb-4">{data.meaning}</p>
      
      <div className="bg-morandi-bg rounded-xl p-4 border-l-4 border-morandi-blue">
        <p className="text-morandi-charcoal text-lg italic mb-1">"{data.sentence}"</p>
        <p className="text-sm text-gray-500">{data.translation}</p>
      </div>
    </div>
  );
};

export default WordCard;