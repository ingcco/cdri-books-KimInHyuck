import { Link } from "react-router";
import { ROUTES } from "@/constants/routes";

// critical 에러(401/403/404/503/5xx) 랜딩 라우트(/error) — QueryCache onError에서 이동.
const ErrorPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col items-center gap-y-4 py-20 text-center">
      <h1 className="title2 text-text-primary">일시적인 오류가 발생했어요</h1>
      <p className="caption text-text-secondary">잠시 후 다시 시도해 주세요.</p>
      <Link to={ROUTES.home} className="caption text-primary underline">
        도서 검색으로 돌아가기
      </Link>
    </div>
  );
};

export default ErrorPage;
