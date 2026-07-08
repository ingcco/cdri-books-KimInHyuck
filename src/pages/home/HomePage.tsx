import ResultSection from "./components/ResultSection";
import SearchBar from "./components/SearchBar";
import { HomeContext, useHome, useHomeContext } from "./hooks/useHome";
import { pageVariants } from "./styles/page.style";

const styles = pageVariants();

const HomePageContent = () => {
  const { result } = useHomeContext();

  return (
    <div className={styles.container()}>
      <h1 className={styles.title()}>도서 검색</h1>
      <SearchBar />
      {result.isFetched && <ResultSection />}
    </div>
  );
};

const HomePage = () => {
  const value = useHome();

  return (
    <HomeContext.Provider value={value}>
      <HomePageContent />
    </HomeContext.Provider>
  );
};

export default HomePage;
