import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Code from "@site/src/components/Code";

const features = [
  {
    title: "Contextual Networking API",
    // imageUrl: 'img/undraw_docusaurus_mountain.svg',
    description: (
      <>
        Remotes are managed entirely by RbxNet. All you need are identifiers for
        the remotes.
        <br />
        <br />
        The code is segregated, to make the APIs more clean and clear.
        <br />
        <br />
        <code>Net.Server</code> is for server code, <code>Net.Client</code> is
        for client code. Simple as that.
      </>
    ),
  },
  {
    title: "Networking Middleware",
    // imageUrl: 'img/undraw_docusaurus_tree.svg',
    description: (
      <>
        RbxNet comes with built-in useful middleware such as{" "}
        <Link to="/docs/2.x/middleware/types">RuntimeTypeCheck</Link> and{" "}
        <Link to="/docs/2.x/middleware/rate-limit">RateLimit</Link>, but you can
        also roll your{" "}
        <Link to="/docs/2.x/custom-middleware">own custom middleware</Link>.
      </>
    ),
  },
  {
    title: "Definitions API",
    // imageUrl: 'img/undraw_docusaurus_react.svg',
    description: (
      <>
        Take advantage of the declarative{" "}
        <Link to="/docs/2.x/definitions">Definitions API</Link>, which allows
        you to define your remote instances in one place, and use anywhere else.
        Types generated for you.
      </>
    ),
  },
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx("col col--4", styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

const EXAMPLE_CODE_TS = `import Net from "@rbxts/net";
const TestIdRemote = new Net.Server.Event("TestId");
TestIdRemote.Connect((message: string) => {

})`;
const EXAMPLE_CODE_LUA = `local Net = require(game:GetService("ReplicatedStorage").Net)
local TestIdRemote = Net.Server.Event.new("TestId")
TestIdRemote:Connect(function()
end)`;

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <header className={clsx("hero", styles.heroBanner)}>
        <div className="container">
          <img src={useBaseUrl("img/net2.svg")} />
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                "button button--outline button--primary button--lg",
                styles.getStarted
              )}
              to={useBaseUrl("docs/1.3.x")}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        <section className={styles.codeExample}>
          <div className="container">
            <div className="row row--no-gutters">
              <div className="col col--2" />
              <div className="col col--8">
                <Code>
                  <CodeBlock className="ts">{EXAMPLE_CODE_TS}</CodeBlock>
                  <CodeBlock className="lua">{EXAMPLE_CODE_LUA}</CodeBlock>
                </Code>
              </div>
              <div className="col col--2" />
            </div>
          </div>
        </section>

        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
