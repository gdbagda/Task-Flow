import React, { useRef } from 'react';
import type { KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  placeholder = 'Type a tag and press Enter',
  maxTags = 10,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const val = (e.target as HTMLInputElement).value.trim();

    if ((e.key === 'Enter' || e.key === ',') && val) {
      e.preventDefault();
      if (tags.length >= maxTags) return;
      if (tags.includes(val)) return;
      if (val.length > 30) return;
      onChange([...tags, val]);
      (e.target as HTMLInputElement).value = '';
    }

    if (e.key === 'Backspace' && !val && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (idx: number) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  return (
    <div
      className="tag-input-wrapper"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, idx) => (
        <span key={tag} className="tag-chip">
          {tag}
          <button
            type="button"
            className="tag-chip-remove"
            onClick={(e) => { e.stopPropagation(); removeTag(idx); }}
            aria-label={`Remove tag ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      {tags.length < maxTags && (
        <input
          ref={inputRef}
          type="text"
          className="tag-input-field"
          placeholder={tags.length === 0 ? placeholder : ''}
          onKeyDown={handleKeyDown}
          maxLength={30}
          aria-label="Add tag"
        />
      )}
    </div>
  );
};

export default TagInput;