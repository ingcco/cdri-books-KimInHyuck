import { m } from "framer-motion";
import { Link, NavLink } from "react-router";
import { ROUTES } from "@/constants/routes";

const NAV_ITEMS = [
  { to: ROUTES.home, label: "도서 검색", end: true },
  { to: ROUTES.favorites, label: "내가 찜한 책", end: false },
];

const Header = () => {
  return (
    <header className="h-20 w-full">
      <div className="relative mx-[160px] flex h-full items-center gap-x-[400px]">
        <Link to={ROUTES.home} className="title1 text-text-primary">
          CERTICOS BOOKS
        </Link>
        <nav className="flex items-center gap-x-14">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className="body1 text-text-primary relative pb-2">
              {({ isActive }) => (
                <>
                  {label}
                  {isActive && (
                    <m.div
                      layoutId="nav-underline"
                      className="bg-primary absolute inset-x-0 bottom-0 h-px"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
