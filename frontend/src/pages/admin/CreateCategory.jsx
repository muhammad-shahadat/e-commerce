import React, { useState } from 'react'
import {
  Plus,
  FolderPlus,
  Loader2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

import useGetCategories from '../../hooks/useCategoryQueries'
import { useCreateCategories } from '../../hooks/useCategoryMutations'

const CreateCategory = () => {
  const { data: categories = [], isLoading } = useGetCategories()
  const { mutate, isPending } = useCreateCategories()

  const [selectedChain, setSelectedChain] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')

  const getSubCategories = (id) => {
    return categories.filter((cat) => cat.parent_id === id)
  }

  const handleChangeChain = (index, value) => {
    if (!value) {
      setSelectedChain(selectedChain.slice(0, index))
      return
    }
    const newChain = [...selectedChain.slice(0, index), value]
    setSelectedChain(newChain)
  }

  const handleSubmit = () => {
    if (!newCategoryName) return

    // the last id of the chain will be parent_id
    const parentId =
      selectedChain.length > 0 ? selectedChain[selectedChain.length - 1] : null

    mutate(
      { categoryName: newCategoryName, parentId },
      {
        onSuccess: () => {
          setNewCategoryName('')
        },
      },
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100 mt-10">
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <FolderPlus className="text-blue-600" size={28} />
        <div>
          <h2 className="text-xl font-bold text-gray-800">Create Category</h2>
          <p className="text-xs text-gray-500">
            Add categories at any level of your category tree
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* --- Step 1: Select Parent Path --- */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Select Parent Location (Optional)
          </label>

          {/* Main Level */}
          <div className="relative">
            <select
              value={selectedChain[0] || ''}
              onChange={(e) => handleChangeChain(0, e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isLoading ? (
                <option>Fetching categories...</option>
              ) : (
                <>
                  <option value="">Set as Main Category (Root)</option>
                  {getSubCategories(null).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </>
              )}
            </select>
            <div className="absolute right-3 top-3.5 pointer-events-none">
              {isLoading ? (
                <Loader2 className="text-blue-500 animate-spin" size={18} />
              ) : (
                <ChevronDown className="text-gray-400" size={18} />
              )}
            </div>
          </div>

          {/* Dynamic Sub-levels */}
          {selectedChain.map((id, index) => {
            const subCats = getSubCategories(id)
            if (subCats.length === 0) return null
            return (
              <div
                key={id}
                className="flex items-center gap-2 animate-in slide-in-from-left-2"
              >
                <ChevronRight size={16} className="text-gray-300" />
                <div className="relative w-full">
                  <select
                    value={selectedChain[index + 1] || ''}
                    onChange={(e) =>
                      handleChangeChain(index + 1, e.target.value)
                    }
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      Under {categories.find((c) => c.id === id)?.name}
                    </option>
                    {subCats.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* --- Step 2: New Category Name --- */}
        <div className="pt-4 border-t border-dashed">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
            New Category Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Wireless Headphone"
              className="w-full p-4 bg-blue-50/30 border-2 border-blue-100 rounded-xl outline-none focus:border-blue-500 transition-all font-medium"
            />
            <button
              onClick={handleSubmit}
              disabled={isPending || !newCategoryName}
              className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white cursor-pointer rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Plus size={18} /> <span>Create</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateCategory
