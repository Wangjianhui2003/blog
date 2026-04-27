import type { ReactNode } from "react";

import Link from "@docusaurus/Link";
import { usePluginData } from "@docusaurus/useGlobalData";
import Layout from "@theme/Layout";

import styles from "./index.module.css";

type HomeItem = {
    readonly title: string;
    readonly description?: string;
    readonly permalink: string;
    readonly date?: string;
};

type HomeSection = {
    readonly title: string;
    readonly href: string;
    readonly items: readonly HomeItem[];
};

type HomeContentData = {
    readonly sections: readonly HomeSection[];
};

function ContentColumn({ title, href, items }: HomeSection): ReactNode {
    return (
        <section className={styles.column}>
            <div className={styles.columnHeader}>
                <h2 className={styles.columnTitle}>
                    <Link to={href}>{title}</Link>
                </h2>
            </div>

            {items.length > 0 ? (
                <ul className={styles.list}>
                    {items.map((item) => (
                        <li key={item.permalink} className={styles.item}>
                            <Link className={styles.itemLink} to={item.permalink}>
                                {item.title}
                            </Link>
                            {item.date ? (
                                <time className={styles.date} dateTime={item.date}>
                                    {item.date}
                                </time>
                            ) : null}
                            {item.description ? (
                                <p className={styles.description}>{item.description}</p>
                            ) : null}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.empty}>暂无内容</p>
            )}

            <Link className={styles.moreLink} to={href}>
                查看全部
            </Link>
        </section>
    );
}

export default function Home(): ReactNode {
    const { sections } = usePluginData("home-content", undefined, {
        failfast: true,
    }) as HomeContentData;

    return (
        <Layout>
            <main className={styles.main}>
                <div className="container">
                    <section className={styles.grid} aria-label="Recent content">
                        {sections.map((section) => (
                            <ContentColumn key={section.href} {...section} />
                        ))}
                    </section>
                </div>
            </main>
        </Layout>
    );
}
