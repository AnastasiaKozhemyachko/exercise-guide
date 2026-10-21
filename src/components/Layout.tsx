import {
  ArrowUpRight,
  BookOpen,
  Flower2,
  Layers3,
  ClipboardCheck,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
export function Layout() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    main.current?.focus();
  }, [pathname]);
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Перейти к содержимому
      </a>
      <header className="site-header">
        <div className="header-inner">
          <NavLink to="/" className="brand" aria-label="Форма — главная">
            <span className="brand-symbol">
              <Flower2 size={24} />
            </span>
            форма<span className="brand-dot">.</span>
          </NavLink>
          <nav aria-label="Основная навигация">
            <NavLink to="/" end>
              <BookOpen size={17} /> Библиотека
            </NavLink>
            <NavLink to="/workouts">
              <Layers3 size={17} /> Тренировки
            </NavLink>
            <NavLink to="/review" aria-label="Проверка техники">
              <ClipboardCheck size={17} /> Проверка
            </NavLink>
          </nav>
          <span className="header-note">
            Движение с пониманием <ArrowUpRight size={16} />
          </span>
        </div>
      </header>
      <main id="main" ref={main} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div>
          <span className="footer-brand">форма.</span>
          <span>Твоя личная библиотека движения</span>
        </div>
        <p>Изучай технику. Двигайся в своём темпе.</p>
      </footer>
    </>
  );
}
