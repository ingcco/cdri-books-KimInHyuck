import type { DropdownListItem } from "@/components/dropdown/Dropdown";
import type { SearchTarget } from "@/lib/api/books/api.interface";

// 상세검색 대상 옵션 — Dropdown은 도메인 무지, 옵션 리스트는 여기서 주입.
// 저자명은 카카오 target "person"(인명)에 대응.
export const dropdownList = {
  searchTarget: [
    { label: "제목", value: "title" },
    { label: "저자명", value: "person" },
    { label: "출판사", value: "publisher" },
  ] satisfies DropdownListItem<SearchTarget>[],
};
