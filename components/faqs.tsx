"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface RichText {
  raw: any
  html: string
}

interface Faq {
  question: string
  answer: RichText
}

interface FaqsProps {
  faqs: Faq[]
}

export default function Faqs({ faqs }: FaqsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">FREQUENTLY ASKED QUESTIONS</h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border bg-white overflow-hidden">
              <button
                className="flex justify-between items-center w-full p-4 text-left font-medium"
                onClick={() => toggleFaq(index)}
                aria-expanded={openIndex === index}
              >
                {faq.question}
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 flex-shrink-0" />
                )}
              </button>

              {openIndex === index && (
                <div className="p-4 pt-0 border-t">
                  <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: faq.answer.html }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
