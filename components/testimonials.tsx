import { Star } from "lucide-react"

interface RichText {
  raw: any
  html: string
}

interface Testimonial {
  name: string
  comment: RichText
  rating: number
  position?: string
  date: string
}

interface TestimonialsProps {
  testimonials: Testimonial[]
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">WHAT OUR CUSTOMERS SAY</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 shadow-sm border">
              <div className="flex mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <div
                className="text-gray-700 mb-4 italic"
                dangerouslySetInnerHTML={{ __html: testimonial.comment.html }}
              />
              <div className="mt-auto">
                <p className="font-semibold">{testimonial.name}</p>
                {testimonial.position && <p className="text-sm text-gray-500">{testimonial.position}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
