import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTitle } from "../lib/useTitle";
export function NotFound() {
  useTitle("Страница не найдена");
  return (
    <div className="page not-found">
      <span className="eyebrow">404 · НЕ НАШЛОСЬ</span>
      <h1>
        Кажется, мы свернули
        <br />
        не туда.
      </h1>
      <p>Такой страницы нет. Вернёмся к знакомым движениям?</p>
      <Link className="primary-button" to="/">
        В библиотеку <ArrowRight size={16} />
      </Link>
    </div>
  );
}
