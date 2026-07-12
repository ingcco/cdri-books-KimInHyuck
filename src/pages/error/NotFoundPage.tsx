import { Link } from "react-router";
import { ROUTES } from "@/constants/routes";

const NotFoundPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col items-center gap-y-3 py-20 text-center">
      <h1 className="title2 text-text-primary">페이지를 찾을 수 없어요</h1>
      <Link to={ROUTES.home} className="caption text-primary underline">
        도서 검색으로 돌아가기
      </Link>
    </div>
  );
};

export default NotFoundPage;
