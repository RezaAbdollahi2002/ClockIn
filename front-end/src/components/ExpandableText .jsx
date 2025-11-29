import { useState } from "react";

const ExpandableText = ({ text, limit = 50 }) => {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const isLong = text.length > limit;
  const displayText = expanded ? text : text.slice(0, limit);

  return (
    <div>
      <span>{displayText}{!expanded && isLong && "…"}</span>
      
      {isLong && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-gray-800 font-bold  ml-1 hover:underline"
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
};

export default ExpandableText;
