import { useState } from 'react';
import styled from '@emotion/styled';

const SearchContainer = styled.div`
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 300px;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

function Search({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <SearchContainer>
      <form onSubmit={handleSubmit}>
        <SearchInput
          type="text"
          placeholder="Search locations..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
    </SearchContainer>
  );
}

export default Search; 