import { Image } from "@shopify/hydrogen";
import step1 from "../assets/step1.avif";
import step2 from "../assets/step2.avif";
import step3 from "../assets/step3.avif";
import step4 from "../assets/step4.avif";

export default function HowToUse() {
  const steps = [
    {
      image: step1,
      steps: "step1",
      title: "Filter & Discover",
      description: "Smart filtering and suggestions make it easy to find",
      bgColor: "bg-red-200",
      textColor: "text-red-900"
    },
    {
      image: step2,
      steps: "step2",
      title: "Compare & Choose",
      description: "Quickly compare features and choose the best option",
      bgColor: "bg-blue-200",
      textColor: "text-blue-900"
    },
    {
      image: step3,
      steps: "step3",
      title: "Order & Checkout",
      description: "Seamless checkout with multiple payment options",
      bgColor: "bg-green-200",
      textColor: "text-green-900"
    },
    {
      image: step4,
      steps: "step4",
      title: "Track & Enjoy",
      description: "Track your order easily until it arrives at your door",
      bgColor: "bg-purple-200",
      textColor: "text-purple-900"
    },
  ];

  return (
    <div className="mx-auto grid py-30 w-full max-w-7xl lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-6">
      {steps.map((el, index) => (
        <div key={index} className="flex flex-col items-center text-center p-4">
          <Image src={el.image} alt={el.title | "Image"} width={144} height={144} sizes="(max-width: 768px) 100px, 200px" className="w-24 h-24 mb-10" />
          <p className={`text-sm font-semibold block ${el.bgColor} rounded-full`}>
            <span className={`py-4 px-2 capitalize ${el.textColor}`}>{el.steps}</span>
          </p>
          <h2 className="text-lg font-bold">{el.title}</h2>
          <p className="text-gray-600">{el.description}</p>
        </div>
      ))}
    </div>
  );
}