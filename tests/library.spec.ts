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
  await page.getByLabel("Тип упражнения").selectOption("Разминка");
  await expect(page.getByRole("status")).toHaveText("Найдено упражнений: 0");
  await page.getByRole("button", { name: "Сбросить фильтры" }).first().click();
  await page.getByRole("link", { name: /DB Squat Присед с гантелями/ }).click();
  await expect(page).toHaveURL(/\/exercises\/db-squat$/);
  await expect(
    page.getByRole("heading", { name: "Присед с гантелями", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Иллюстрация ожидает загрузки")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Увеличить", exact: true }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "Все упражнения" }).click();
  await expect(page).toHaveURL("/");
  expect(errors).toEqual([]);
});
test("подборки не выдают пример за реальную тренировку и сохраняют повторы", async ({
  page,
}) => {
  await page.goto("/workouts");
  await expect(
    page.getByRole("heading", { name: "Здесь будет твоя первая тренировка" }),
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
  await expect(page.getByRole("status")).toHaveText("Найдено упражнений: 1");
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
  // Техническое изображение только в перехваченном тестовом ответе: не контент библиотеки.
  await page.route(
    "**/images/russian_dumbbell_squat_technique_guide.png",
    (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1122" height="1402"><rect width="1122" height="1402" fill="white"/><text x="30" y="50">TEST IMAGE</text></svg>',
      }),
  );
  await page.goto("/exercises/db-squat");
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
