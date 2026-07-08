import { Link, NavLink } from "react-router";
import { ROUTES } from "@/constants/routes";

// Figma `Header`(1920×80) 1:1 — 로고 좌측 + 탭 중앙(우측 여백). 활성 탭은 primary 언더라인.
const NAV_ITEMS = [
  { to: ROUTES.home, label: "도서 검색", end: true },
  { to: ROUTES.favorites, label: "내가 찜한 책", end: false },
];

const Header = () => {
  return (
    <header className="h-20 w-full">
      <div className="relative mx-auto flex h-full max-w-[1620px] items-center px-4">
        <Link to={ROUTES.home} className="title1 text-text-primary">
          CERTICOS BOOKS
        </Link>
        <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-x-8">
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
