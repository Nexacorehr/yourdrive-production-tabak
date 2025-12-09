import React from "react";

import SearchIcon from "../../../../shared/icons/searchIcon";
import FilterIcon from "../../../../shared/icons/filter";
import {
  SearchContainer,
  InputWrapper,
  FilterButtons,
  FilterButton,
  FilterText,
} from "../styles/search.styles";
import FileIcon from "../../../../shared/icons/file";
import PersonIcon from "../../../../shared/icons/person";
import CalendarIcon from "../../../../shared/icons/calendar";

interface QuickSearchProps {
  // Add props as needed
}

const QuickSearch: React.FC<QuickSearchProps> = () => {
  const iconColor = "#1A1A1A";

  return (
    <SearchContainer>
      <InputWrapper>
        <SearchIcon color={iconColor} />
        <input type="text" placeholder="Search by name or keyword..." />
        <FilterIcon color={iconColor} />
      </InputWrapper>

      <FilterButtons>
        <FilterButton>
          <span>
            <FileIcon color={iconColor} />
          </span>
          <FilterText>Type</FilterText>
        </FilterButton>
        <FilterButton>
          <span>
            <PersonIcon color={iconColor} />
          </span>
          <FilterText>Person</FilterText>
        </FilterButton>
        <FilterButton>
          <span>
            <CalendarIcon color={iconColor} />
          </span>
          <FilterText>Last Modified</FilterText>
        </FilterButton>
      </FilterButtons>
    </SearchContainer>
  );
};

export default QuickSearch;
