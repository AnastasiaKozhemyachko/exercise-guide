import { TechniqueReview } from "./pages/TechniqueReview";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { contentErrors } from "./lib/content";
import { Library } from "./pages/Library";
import { ExerciseDetail } from "./pages/ExerciseDetail";
import { Workouts } from "./pages/Workouts";
import { WorkoutDetail } from "./pages/WorkoutDetail";
import { NotFound } from "./pages/NotFound";
const Router =
  import.meta.env.MODE === "github-pages" ? HashRouter : BrowserRouter;

export default function App() {
  if (contentErrors.length)
    return (
      <div className="page">
        <h1>Не удалось загрузить библиотеку</h1>
        <p>
          В данных есть ошибки. Проверьте их командой npm run validate:content.
        </p>
      </div>
    );
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Library />} />
          <Route path="exercises/:slug" element={<ExerciseDetail />} />
          <Route path="workouts" element={<Workouts />} />
          <Route path="review" element={<TechniqueReview />} />
          <Route path="workouts/:slug" element={<WorkoutDetail />} />
          <Route
            path="examples/workouts/:slug"
            element={<WorkoutDetail fixture />}
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
