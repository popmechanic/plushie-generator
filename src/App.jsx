import React, { useState } from "react"
import { useFireproof } from "use-fireproof"
import { callAI } from "call-ai"
import { ImgGen } from "use-vibes"

export default function PlushieCreator() {
  const { database, useLiveQuery } = useFireproof("plushie-creator")
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [generatingDoc, setGeneratingDoc] = useState(null)
  
  // Query for all image documents
  const { docs: allImages } = useLiveQuery('type', {
    key: 'image',
    descending: true,
  })

  const generatePlushieName = () => {
    const adjectives = ['Snuggly', 'Cuddly', 'Fuzzy', 'Bouncy', 'Squeaky', 'Huggable', 'Adorable', 'Precious', 'Sweet', 'Cozy', 'Fluffy', 'Gentle', 'Cheerful', 'Dreamy', 'Magical']
    const animals = ['Bear', 'Bunny', 'Kitty', 'Puppy', 'Fox', 'Owl', 'Panda', 'Tiger', 'Lion', 'Elephant', 'Penguin', 'Deer', 'Unicorn', 'Dragon', 'Monkey']
    const suffixes = ['Pal', 'Friend', 'Buddy', 'Companion', 'Snuggle', 'Joy', 'Heart', 'Dream', 'Wonder', 'Magic', 'Cuddle', 'Hug', 'Love', 'Smile']
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const animal = animals[Math.floor(Math.random() * animals.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    
    return `${adjective} ${animal} ${suffix}`
  }

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files[0]) handleFileUpload(files[0])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const generatePlushie = async () => {
    if (uploadedFile) {
      const doc = await database.put({
        type: 'image',
        prompt: 'Turn this into a cute plush toy on a white studio pedestal: stitched fabric texture, button eyes, chibi proportions, gentle front light, soft shadows, product-photography style',
        name: generatePlushieName(),
        uploadedAt: Date.now(),
        _files: { original: uploadedFile }
      })
      
      setGeneratingDoc({ _id: doc.id })
      setUploadedFile(null)
    }
  }

  const handleGenerationComplete = () => {
    // Clear the generating state when image is complete
    setGeneratingDoc(null)
  }

  // Filter gallery items - exclude the currently generating one to avoid duplication
  const galleryItems = allImages.filter(doc => 
    !generatingDoc || doc._id !== generatingDoc._id
  )

  return (
    <div className="min-h-screen p-4" style={{
      background: `
        radial-gradient(circle at 20% 80%, #ff70a6 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, #70d6ff 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, #ffd670 0%, transparent 40%),
        repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, #e9ff70 2deg, transparent 4deg),
        #ffffff
      `
    }}>
      <div className="w-full">
        <div className="text-center mb-8 p-6 bg-white/90 backdrop-blur-sm rounded-3xl border-4 border-black shadow-lg">
          <h1 className="text-4xl font-black text-black mb-4">🧸 PLUSHIE CREATOR</h1>
          <p className="text-lg text-gray-800 italic">
            *Transform any photo into an **adorable plush toy design** with AI magic! Upload your selfie, pet photo, or any image and watch it become a cute stuffed animal with button eyes and stitched fabric textures.*
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl border-4 border-black shadow-lg">
            <h2 className="text-2xl font-bold text-black mb-4">📤 Upload Your Photo</h2>
            
            <div
              className={`border-4 border-dashed rounded-2xl p-8 transition-all ${
                isDragOver 
                  ? 'border-#ff70a6 bg-#ff70a6/10' 
                  : 'border-black/30 hover:border-#70d6ff'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer block text-center">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-xl font-bold text-black mb-2">Drop your photo here</p>
                <p className="text-gray-600">or click to browse</p>
              </label>
            </div>

            {uploadedFile && (
              <div className="mt-4 p-4 bg-#e9ff70/20 rounded-2xl border-2 border-black">
                <p className="font-bold text-black mb-2">📁 Uploaded: {uploadedFile.name}</p>
                <button
                  onClick={generatePlushie}
                  className="w-full bg-#ff70a6 text-black font-bold py-3 px-6 rounded-xl border-3 border-black hover:bg-#ff9770 transition-colors shadow-lg"
                >
                  ✨ Transform to Plushie!
                </button>
              </div>
            )}
          </div>

          {/* Current Generation */}
          {generatingDoc && (
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl border-4 border-black shadow-lg">
              <h2 className="text-2xl font-bold text-black mb-4">🎨 Creating Your Plushie</h2>
              <div className="rounded-2xl overflow-hidden border-3 border-black">
                <ImgGen 
                  _id={generatingDoc._id}
                  database={database}
                  onLoad={handleGenerationComplete}
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
        </div>

        {/* Gallery - Always show this section */}
        <div className="mt-8 bg-white/95 backdrop-blur-sm p-6 rounded-3xl border-4 border-black shadow-lg">
          <h2 className="text-2xl font-bold text-black mb-6 text-center">🏛️ Plushie Gallery</h2>
          
          {galleryItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryItems.map((design) => (
                <div 
                  key={design._id} 
                  className="bg-white rounded-2xl border-3 border-black overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <ImgGen 
                      _id={design._id} 
                      database={database}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-gray-800 truncate mb-1">
                      {design.name || 'Cute Plushie'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {new Date(design.createdAt || design.uploadedAt || design._id.split('|')[1]).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🧸</div>
              <p className="text-lg text-gray-600 italic">
                No plushies in gallery yet! Upload a photo to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}