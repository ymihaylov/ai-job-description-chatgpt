import Head from "next/head";
import { Inter } from "@next/font/google";
import Dashboard from "@/components/Dashboard";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>AI Job Description Generator</title>
        <meta name="description" content="AI Job Description Generator" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={"min-h-screen bg-chatgpt-darkgrey"}>
        <div className="flex flex-col items-center justify-center px-4 py-2">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            AI Job Description
            <span className="text-4xl md:text-6xl font-bold text-chatgpt-green">
              {" "}
              Generator.
            </span>
          </h1>
          <p className="mt-3 text-2xl text-slate-400">
            Powered by
            <span className="text-2xl font-bold text-chatgpt-green">
              {" "}
              <a href="https://openai.com/blog/chatgpt/">ChatGPT</a>
            </span>.

            Inspired by
            <span className="text-2xl font-bold text-chatgpt-green">
              {" "}
              <a href="https://www.freecodecamp.org/">freecodecamp.org</a>
            </span>.
          </p>
        </div>
        <Dashboard />
      </main>
    </>
  );
}
