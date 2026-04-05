import { expect, type Page } from '@playwright/test';

export async function dismissStartupIntro(page: Page): Promise<void> {
    const intro = page.getByRole('dialog', { name: /startup relic intro/i });
    const playButton = page.getByRole('button', { name: /^play$/i });
    const introVisible = await intro.isVisible().catch(() => false);

    if (introVisible) {
        await intro
            .dispatchEvent('click')
            .catch(
                async () =>
                    await intro
                        .evaluate((el) => {
                            (el as HTMLElement).click();
                        })
                        .catch(() => {})
            );
    }

    await expect
        .poll(
            async () => ({
                introVisible: await intro.isVisible().catch(() => false),
                playVisible: await playButton.isVisible().catch(() => false)
            }),
            { timeout: 15000 }
        )
        .toEqual({
            introVisible: false,
            playVisible: true
        });
}
