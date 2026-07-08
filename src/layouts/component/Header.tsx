import { Link, NavLink } from "react-router";
import { ROUTES } from "@/constants/routes";

// Figma `Header`(1920×80) 1:1 — 로고 title1 + 탭 body1, 활성 탭은 primary 언더라인.
// 탭 컴포넌트 대신 NavLink로 라우트 링크 처리(사용자 결정) — isActive로 활성 스타일 분기.
const NAV_ITEMS = [
  { to: ROUTES.home, label: "도서 검색", end: true },
  { to: ROUTES.favorites, label: "내가 찜한 책", end: false },
];

const Header = () => {
  return (
    <header className="h-20 w-full">
      <div className="mx-auto flex h-full max-w-[960px] items-center justify-between px-4">
        <Link to={ROUTES.home} className="title1 text-text-primary">
          CERTICOS BOOKS
        </Link>
        <nav className="flex items-center gap-x-8">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `body1 border-b-2 pb-2 ${isActive ? "border-primary text-text-primary" : "text-text-subtitle border-transparent"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
