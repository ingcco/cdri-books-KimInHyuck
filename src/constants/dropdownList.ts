import type { DropdownListItem } from "@/components/dropdown/Dropdown";
import type { SearchTarget } from "@/lib/api/books/api.interface";

export const dropdownList = {
  searchTarget: [
    { label: "제목", value: "title" },
    { label: "저자명", value: "person" },
    { label: "출판사", value: "publisher" },
  ] satisfies DropdownListItem<SearchTarget>[],
};
