import { m } from "framer-motion";
import { useHomeContext } from "../hooks/useHome";
import { detailSearchPopoverVariants } from "../styles/DetailSearchPopover.style";
import CloseIcon from "@/assets/icons/close.svg";
import Button from "@/components/button/Button";
import Dropdown from "@/components/dropdown/Dropdown";
import Input from "@/components/input/Input";
import { dropdownList } from "@/constants/dropdownList";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { animation } from "@/lib/animation/transition";

const styles = detailSearchPopoverVariants();

const DetailSearchPopover = () => {
  const { detailSearch } = useHomeContext();
  const ref = useOutsideClick<HTMLDivElement>(detailSearch.isOpen, detailSearch.close);

  if (!detailSearch.isOpen) return null;

  return (
    <m.div
      ref={ref}
      {...animation.dropdown}
      role="dialog"
      aria-label="상세 검색"
      className={styles.popover()}
    >
      <button
        type="button"
        aria-label="상세 검색 닫기"
        className={styles.close()}
        onClick={detailSearch.close}
      >
        <CloseIcon aria-hidden="true" className="size-3" />
      </button>
      <div className={styles.row()}>
        <Dropdown
          label="검색 대상"
          value={detailSearch.target}
          list={dropdownList.searchTarget}
          onChange={detailSearch.setTarget}
          className={styles.dropdown()}
        />
        <Input
          value={detailSearch.query}
          aria-label="상세 검색어"
          placeholder="검색어 입력"
          containerClassName={styles.input()}
          onChange={(event) => detailSearch.setQuery(event.target.value)}
          onEnter={detailSearch.submit}
        />
      </div>
      <Button buttonType="primary" size="full" onClick={detailSearch.submit}>
        검색하기
      </Button>
    </m.div>
  );
};

export default DetailSearchPopover;
