import { Select, Tag as AntTag } from "antd";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { tagsAtom, setTagsAtom } from "src/atoms";

interface TagSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const TagSelector = ({ value, onChange, placeholder, style }: TagSelectorProps) => {
  const tags = useAtomValue(tagsAtom);
  const setTags = useSetAtom(setTagsAtom);

  useEffect(() => {
    setTags();
  }, [setTags]);

  const handleChange = (selectedTags: string[]) => {
    onChange?.(selectedTags);
  };

  const tagRender = (props: any) => {
    const { label, value, closable, onClose } = props;
    const tag = tags.find(t => t.name === value);
    const color = tag?.color || '#1890ff';

    return (
      <AntTag
        color={color}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </AntTag>
    );
  };

  return (
    <Select
      mode="tags"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      style={style}
      tagRender={tagRender}
      optionFilterProp="label"
    >
      {tags.map((tag: any) => (
        <Select.Option key={tag.id} value={tag.name} label={tag.name}>
          <AntTag color={tag.color} style={{ marginRight: 8 }}>
            {tag.name}
          </AntTag>
        </Select.Option>
      ))}
    </Select>
  );
};

export default TagSelector;