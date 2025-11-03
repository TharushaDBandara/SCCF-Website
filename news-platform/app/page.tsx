import { client } from '@/lib/sanity'
import ArticleCard from '@/components/ArticleCard'

const articlesQuery = `*[_type == "article"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage,
  author->{
    name
  }
}`

async function getArticles() {
  try {
    const articles = await client.fetch(articlesQuery)
    return articles
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

export default async function Home() {
  const articles = await getArticles()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-darkgreen text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            SCCF News & Stories
          </h1>
          <p className="text-lg md:text-xl text-lightaqua max-w-3xl mx-auto">
            Stay informed about our community initiatives, impact stories, and the latest updates 
            from Social Community Charity Foundation
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-darkgreen">
              Latest Articles
            </h2>
            <div className="h-1 flex-grow ml-8 bg-primary rounded"></div>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-2xl font-semibold text-darkgray mb-3">No Articles Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We're working on bringing you inspiring stories and updates. 
                Check back soon for our latest news!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article: any) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-darkgreen mb-6">
            Join Our Community
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Be part of the change. Subscribe to our newsletter for updates on 
            community projects, volunteer opportunities, and inspiring stories.
          </p>
          <button className="btn-primary">
            Subscribe to Newsletter
          </button>
        </div>
      </section>
    </div>
  )
}
