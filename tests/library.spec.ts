import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import JSZip from "jszip";
const workout = "/workouts/hasfit-legs-glutes-dumbbells";
async function choose(
  page: import("@playwright/test").Page,
  label: string,
  option: string,
) {
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("каталог: поиск, новые фильтры с клавиатурой, прямая карточка и хлебные крошки", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("searchbox").fill("DuMbBeLl SQUAT");
  await expect(page.getByRole("status")).toHaveText("Найдено упражнений: 1");
  await page.getByRole("button", { name: "Спина", exact: true }).click();
  await expect(page.getByText("Такого упражнения пока нет")).toBeVisible();
  await page.getByRole("button", { name: "Сбросить фильтры" }).first().click();
  await page
    .getByRole("button", { name: "Тип упражнения", exact: true })
    .focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Найдено упражнений: 0");
  await page.getByRole("button", { name: "Сбросить фильтры" }).first().click();
  await page.locator('a[href="/exercises/db-squat"]').click();
  await expect(page.locator(".instruction-paper img")).toBeVisible();
  await expect(page.getByText(/техника требует проверки/i)).toHaveCount(0);
  await expect(page.getByText("Посмотреть черновик карточки")).toHaveCount(0);
  await page.reload();
  await page
    .getByRole("navigation", { name: "Хлебные крошки" })
    .getByRole("link", { name: "Библиотека", exact: true })
    .click();
  await expect(page).toHaveURL("/");
  await page.goBack();
  await expect(page).toHaveURL("/exercises/db-squat");
  expect(errors).toEqual([]);
});
test("тренировки: двуязычный поиск, сортировка и отсутствие технических блоков", async ({
  page,
}) => {
  await page.goto("/workouts");
  const search = page.getByRole("searchbox", { name: "Поиск тренировок" });
  await search.fill("LEG AND BUTT");
  await expect(page.getByRole("status")).toHaveText("Найдено тренировок: 1");
  await search.fill("ноги ягодицы");
  await expect(page.getByRole("status")).toHaveText("Найдено тренировок: 1");
  await choose(page, "Сортировка тренировок", "По русскому · А–Я");
  await expect(page).toHaveURL(/sort=ru/);
  await search.fill("unknown");
  await expect(page.getByRole("status")).toHaveText("Найдено тренировок: 0");
  await page.getByRole("button", { name: "Сбросить поиск" }).first().click();
  await expect(page.getByText("Как выглядит подборка")).toHaveCount(0);
  await page.locator(`a[href="${workout}"]`).click();
  await expect(page.locator(".sequence-list li")).toHaveCount(25);
  await expect(
    page.getByText("Последовательность не проверена по видео"),
  ).toHaveCount(0);
  await expect(page.locator(".workout-hero-cover img")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Leg and Butt Lower Body Workout with Weights",
  );
});
test("карточки тренировки: повторы, стрелки, клавиатура, перезагрузка и возврат", async ({
  page,
}) => {
  await page.goto(workout);
  await page.locator(".sequence-list a").nth(2).click();
  await expect(page.locator(".position-indicator")).toHaveText("3 / 25");
  await expect(page.locator(".instruction-paper img")).toBeVisible();
  await page
    .getByRole("link", { name: "Следующее упражнение", exact: true })
    .click();
  await expect(page.locator(".position-indicator")).toHaveText("4 / 25");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".position-indicator")).toHaveText("5 / 25");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Присед с гантелями",
  );
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".position-indicator")).toHaveText("4 / 25");
  await page.reload();
  await expect(page.locator(".position-indicator")).toHaveText("4 / 25");
  await page.getByRole("link", { name: "Вернуться к тренировке" }).click();
  await expect(page).toHaveURL(workout);
});
test("проверка: статусы, комментарии, фильтр, сохранение и смена решения", async ({
  page,
}) => {
  await page.goto("/review");
  const card = page.getByRole("article", {
    name: "Проверка: Присед с гантелями",
    exact: true,
  });
  await card.getByRole("button", { name: "Всё хорошо", exact: true }).click();
  await page.reload();
  await expect(
    card.getByRole("button", { name: "Всё хорошо", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await card
    .getByRole("button", { name: "Нужны исправления", exact: true })
    .click();
  await card
    .getByRole("textbox", { name: "Что исправить" })
    .fill("Колено →\n  Не меняй пробелы.");
  await page.reload();
  await expect(card.getByRole("textbox")).toHaveValue(
    "Колено →\n  Не меняй пробелы.",
  );
  await choose(page, "Статус проверки", "Нужны исправления");
  await expect(page.getByRole("article")).toHaveCount(1);
  await card.getByRole("button", { name: "Всё хорошо", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(0);
  await choose(page, "Статус проверки", "Всё хорошо");
  await expect(card).toBeVisible();
});
test("просмотр проверки: масштаб, панорамирование, стрелки, Escape и фокус", async ({
  page,
}) => {
  await page.goto("/review");
  const trigger = page.getByRole("button", {
    name: "Рассмотреть: Присед с гантелями",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page
    .getByRole("button", { name: "Увеличить масштаб", exact: true })
    .click();
  await expect(dialog.locator("output")).toHaveText("125%");
  const scroll = dialog.locator(".zoom-scroll");
  await scroll.evaluate((e) => {
    e.scrollLeft = 60;
    e.scrollTop = 80;
  });
  expect(await scroll.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator(".viewer-title")).toContainText("2 / 13");
  await expect(dialog.locator("output")).toHaveText("100%");
  await page.keyboard.press("ArrowLeft");
  await expect(dialog.locator(".viewer-title")).toContainText("1 / 13");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
test("копирование отчёта: все группы и точный текст", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          (window as unknown as { copied: string }).copied = text;
        },
      },
    });
  });
  await page.goto("/review");
  const cards = page.getByRole("article");
  await cards
    .nth(0)
    .getByRole("button", { name: "Всё хорошо", exact: true })
    .click();
  await cards
    .nth(1)
    .getByRole("button", { name: "Нужны исправления", exact: true })
    .click();
  await cards.nth(1).getByRole("textbox").fill("Текст\n  с пробелами.");
  await page
    .getByRole("button", {
      name: "Скопировать результаты проверки",
      exact: true,
    })
    .click();
  await expect(page.getByRole("status")).toContainText("скопированы");
  const copied = await page.evaluate(
    () => (window as unknown as { copied: string }).copied,
  );
  expect(copied).toContain("Текст\n  с пробелами.");
  expect(copied).toContain("## Не проверено");
  expect(copied).toContain("## Одобрено");
});
test("ZIP: все PNG с ID, JSON и комментарии; экспорт не очищает оценки", async ({
  page,
}) => {
  await page.goto("/review");
  const card = page.getByRole("article").first();
  await card
    .getByRole("button", { name: "Нужны исправления", exact: true })
    .click();
  const note = "Стрелка неправильно\n  Исправить подпись.";
  await card.getByRole("textbox").fill(note);
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Скачать ZIP для ChatGPT", exact: true })
    .click();
  const download = await downloadPromise;
  const zip = await JSZip.loadAsync(readFileSync((await download.path())!));
  const json = JSON.parse(
    await zip.file("technique-review/review-results.json")!.async("string"),
  );
  expect(json.exercises).toHaveLength(13);
  expect(json.exercises[0].note).toBe(note);
  expect(
    await zip.file("technique-review/review-report.md")!.async("string"),
  ).toContain(note);
  expect(Object.keys(zip.files).filter((f) => f.endsWith(".png"))).toHaveLength(
    13,
  );
  for (const e of json.exercises) {
    const bytes = await zip
      .file(`technique-review/${e.imageFile}`)!
      .async("uint8array");
    expect(bytes.length).toBeGreaterThan(1_000_000);
    expect(e.imageFile).toBe(`cards/${e.id}.png`);
  }
  await page.reload();
  await expect(
    page.getByRole("article").first().getByRole("textbox"),
  ).toHaveValue(note);
  const input = page.getByLabel("Импорт результатов проверки");
  await input.setInputFiles({
    name: "review-results.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(json)),
  });
  await expect(page.getByRole("status")).toContainText("импортированы");
});
test("мобильная ширина, все изображения и отсутствие переполнения", async ({
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
    const image = page.locator(".instruction-paper img");
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((n: HTMLImageElement) => n.naturalWidth))
      .toBeGreaterThan(1000);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  for (const url of ["/", "/review", "/workouts", workout]) {
    await page.goto(url);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("отказ clipboard показывает отчёт для ручного копирования", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw Error("denied");
        },
      },
      configurable: true,
    });
  });
  await page.goto("/review");
  await page
    .getByRole("button", {
      name: "Скопировать результаты проверки",
      exact: true,
    })
    .click();
  await expect(page.getByRole("status")).toContainText("не разрешил");
  await expect(
    page.getByRole("textbox", { name: "Отчёт для копирования" }),
  ).toHaveValue(/## Не проверено/);
});
test("свайп следует по вхождениям тренировки и карточкам проверки", async ({
  page,
}) => {
  await page.goto(
    "/exercises/db-squat?workout=hasfit-legs-glutes-dumbbells&occurrence=occ-03",
  );
  const card = page.locator(".instruction-section");
  await card.dispatchEvent("touchstart", {
    touches: [{ identifier: 1, clientX: 280, clientY: 350 }],
  });
  await card.dispatchEvent("touchend", {
    changedTouches: [{ identifier: 1, clientX: 100, clientY: 355 }],
  });
  await expect(page.locator(".position-indicator")).toHaveText("4 / 25");
  await page.goto("/review");
  await page
    .getByRole("button", {
      name: "Рассмотреть: Присед с гантелями",
      exact: true,
    })
    .click();
  const scroll = page.locator(".zoom-scroll");
  await scroll.dispatchEvent("pointerdown", {
    button: 0,
    clientX: 280,
    clientY: 350,
    pointerId: 1,
    pointerType: "touch",
  });
  await scroll.dispatchEvent("pointerup", {
    button: 0,
    clientX: 100,
    clientY: 355,
    pointerId: 1,
    pointerType: "touch",
  });
  await expect(page.locator(".viewer-title")).toContainText("2 / 13");
});

test("увеличенный просмотр тренировки остаётся открыт при переходе к следующему вхождению", async ({
  page,
}) => {
  await page.goto(
    "/exercises/db-squat?workout=hasfit-legs-glutes-dumbbells&occurrence=occ-03",
  );
  await page.getByRole("button", { name: "Увеличить", exact: true }).click();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".viewer-title")).toContainText("4 / 25");
  await page.keyboard.press("Escape");
  await expect(page.locator(".position-indicator")).toHaveText("4 / 25");
});
