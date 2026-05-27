def split_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """
    Splits text into chunks of maximum size `chunk_size` characters, with `chunk_overlap` character overlap.
    Tries to split on paragraphs, sentences, or words to preserve semantic structure.
    """
    if not text:
        return []
        
    separators = ["\n\n", "\n", " ", ""]
    
    def _split(text_to_split: str, current_separator_index: int) -> list[str]:
        if len(text_to_split) <= chunk_size:
            return [text_to_split]
            
        if current_separator_index >= len(separators):
            # Hard split by character size
            chunks = []
            for i in range(0, len(text_to_split), chunk_size - chunk_overlap):
                chunks.append(text_to_split[i:i + chunk_size])
            return chunks
            
        separator = separators[current_separator_index]
        
        if separator == "":
            splits = list(text_to_split)
        else:
            splits = text_to_split.split(separator)
            
        chunks = []
        current_chunk = []
        current_length = 0
        
        for split in splits:
            split_len = len(split)
            if split_len > chunk_size:
                if current_chunk:
                    chunks.append(separator.join(current_chunk))
                    current_chunk = []
                    current_length = 0
                sub_chunks = _split(split, current_separator_index + 1)
                chunks.extend(sub_chunks)
            else:
                join_len = len(separator) if current_chunk else 0
                if current_length + join_len + split_len > chunk_size:
                    chunks.append(separator.join(current_chunk))
                    
                    # Backtrack to build overlap
                    overlap_chunk = []
                    overlap_len = 0
                    for prev_split in reversed(current_chunk):
                        prev_join_len = len(separator) if overlap_chunk else 0
                        if overlap_len + prev_join_len + len(prev_split) <= chunk_overlap:
                            overlap_chunk.insert(0, prev_split)
                            overlap_len += prev_join_len + len(prev_split)
                        else:
                            break
                    current_chunk = overlap_chunk
                    current_length = overlap_len
                
                if current_chunk:
                    current_length += len(separator)
                current_chunk.append(split)
                current_length += split_len
                
        if current_chunk:
            chunks.append(separator.join(current_chunk))
            
        return chunks
        
    return _split(text, 0)
