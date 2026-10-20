import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

test("поиск, фильтры, сброс и открытие упражнения", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Знай движение.*Чувствуй разницу/ }),
  ).toBeVisible();
  const search = page.getByRole("searchbox", { name: "Поиск упражнений" });
  await search.fill("DuMbBeLl SQUAT");
  await expect(page.getByRole("status")).toHaveText("Найдено упражнений: 1");
  await page.getByRole("button", { name: "Спина", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Такого упражнения пока нет" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Сбросить фильтры" }).first().click();
  await expect(search).toHaveValue("");
  await page.getByLabel("Тип упражнения").selectOption("Мобильность");
  await expect(page.getByRole("status")).toHaveText("Найдено упражнений: 0");
  await page.getByRole("button", { name: "Сбросить фильтры" }).first().click();
  await page.getByRole("link", { name: /DB Squat Присед с гантелями/ }).click();
  await expect(page).toHaveURL(/\/exercises\/db-squat$/);
  await expect(
    page.getByRole("heading", { name: "Присед с гантелями", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("note")
      .getByText("Черновик · техника требует проверки", { exact: true }),
  ).toBeVisible();
  await page.getByText("Посмотреть черновик карточки", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Увеличить", exact: true }),
  ).toBeEnabled();
  await page.getByRole("link", { name: "Все упражнения" }).click();
  await expect(page).toHaveURL("/");
  expect(errors).toEqual([]);
});
test("подборки не выдают пример за реальную тренировку и сохраняют повторы", async ({
  page,
}) => {
  await page.goto("/workouts");
  await expect(
    page.getByRole("link", { name: /Ноги и ягодицы с гантелями · HASfit/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Посмотреть структуру/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Показать пример" }).click();
  await page.getByRole("link", { name: /Посмотреть структуру/ }).click();
  await expect(
    page.getByText("Демонстрационный пример", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".sequence-list li")).toHaveCount(2);
  await expect(page.locator(".sequence-list a").nth(0)).toHaveAttribute(
    "href",
    "/exercises/db-squat",
  );
  await expect(page.locator(".sequence-list a").nth(1)).toHaveAttribute(
    "href",
    "/exercises/db-squat",
  );
  await page.locator(".sequence-list a").nth(1).click();
  await expect(page).toHaveURL("/exercises/db-squat");
});
test("загрузка по прямому URL и неизвестные страницы", async ({ page }) => {
  await page.goto("/exercises/db-squat");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Присед с гантелями", exact: true }),
  ).toBeVisible();
  await page.goto("/exercises/missing");
  await expect(page.getByText("404 · НЕ НАШЛОСЬ")).toBeVisible();
  await page.getByRole("link", { name: "В библиотеку" }).click();
  await expect(page).toHaveURL("/");
});
test("URL сохраняет поиск, нет горизонтального переполнения", async ({
  page,
}) => {
  await page.goto("/?q=DB&muscle=Ноги&type=Силовые");
  await expect(page.getByRole("searchbox")).toHaveValue("DB");
  await expect(page.getByRole("status")).toHaveText("Найдено упражнений: 2");
  for (const url of [
    "/",
    "/workouts",
    "/exercises/db-squat",
    "/examples/workouts/hasfit-legs-example",
  ]) {
    await page.goto(url);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
test("масштабирование, Escape и восстановление фокуса при доступном изображении", async ({
  page,
}) => {
  await page.goto("/exercises/db-squat");
  await page.getByText("Посмотреть черновик карточки", { exact: true }).click();
  const trigger = page.getByRole("button", { name: "Увеличить", exact: true });
  await expect(trigger).toBeEnabled();
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page
    .getByRole("button", { name: "Увеличить масштаб", exact: true })
    .click();
  await expect(dialog.locator("output")).toHaveText("125%");
  await page.getByRole("button", { name: "Уменьшить", exact: true }).click();
  await expect(dialog.locator("output")).toHaveText("100%");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("импортированная подборка содержит все 25 вхождений и предупреждение", async ({
  page,
}) => {
  await page.goto("/workouts");
  await page
    .getByRole("link", { name: /Ноги и ягодицы с гантелями · HASfit/ })
    .click();
  await expect(
    page.getByText("Последовательность не проверена по видео", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".sequence-list li")).toHaveCount(25);
  await expect(page.locator(".sequence-list a").nth(2)).toHaveAttribute(
    "href",
    "/exercises/db-squat",
  );
  await expect(page.locator(".sequence-list a").nth(4)).toHaveAttribute(
    "href",
    "/exercises/db-squat",
  );
  await page.locator(".sequence-list a").nth(24).click();
  await expect(page).toHaveURL("/exercises/v-sit-reach");
  await expect(
    page.getByText(/лёгкое сгибание может быть допустимым облегчением/),
  ).toBeVisible();
});
test("все карточки открываются с исходными пропорциями и без переполнения", async ({
  page,
}) => {
  const data: { slug: string }[] = JSON.parse(
    readFileSync(
      new URL("../src/data/exercises.json", import.meta.url),
      "utf8",
    ),
  );
  for (const e of data) {
    await page.goto(`/exercises/${e.slug}`);
    const draft = page.locator(".draft-preview");
    await expect(draft).not.toHaveAttribute("open");
    await draft.locator("summary").click();
    const img = page.locator(".instruction-paper img");
    await expect(img).toBeVisible();
    await expect
      .poll(() => img.evaluate((node: HTMLImageElement) => node.naturalWidth))
      .toBeGreaterThan(1000);
    const ratio = await img.evaluate((node: HTMLImageElement) =>
      Math.abs(
        node.clientWidth / node.clientHeight -
          node.naturalWidth / node.naturalHeight,
      ),
    );
    expect(ratio).toBeLessThan(0.01);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
test("недоступное изображение даёт честный заполнитель", async ({ page }) => {
  await page.route("**/images/hasfit/01_db_squat.png", (route) =>
    route.abort(),
  );
  await page.goto("/exercises/db-squat");
  await page.getByText("Посмотреть черновик карточки", { exact: true }).click();
  await expect(
    page.getByText("Иллюстрация недоступна", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Увеличить", exact: true }),
  ).toBeDisabled();
});
