"use client";

import React, { useState } from "react";

interface ReadMoreProps {
  text: string;
  maxParagraphs?: number;
}

const ReadMore: React.FC<ReadMoreProps> = ({ text, maxParagraphs = 2 }) => {
  // Split text into paragraphs (by double newline or sentence for this case)
  const paragraphs = text.split(". ").map((sentence) => sentence.trim() + ".");
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine paragraphs to display
  const displayedParagraphs = isExpanded
    ? paragraphs
    : paragraphs.slice(0, maxParagraphs);

  // Handle toggle
  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="text-gray-500 leading-7">
      {displayedParagraphs.map((paragraph, index) => (
        <p key={index} className="mb-4">
          {paragraph}
        </p>
      ))}
      {paragraphs.length > maxParagraphs && (
        <button
          onClick={toggleReadMore}
          className="text-blue-500 hover:underline focus:outline-none"
        >
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      )}
    </div>
  );
};

export default ReadMore;
