import React, { useState } from 'react'
import { MdAdd, MdClose } from 'react-icons/md'

const TagInput = ({ tags, setTags }) => {

    const [inputvalue, setInputValue] = useState("");

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const addNewTag = () => {
        if (inputvalue.trim() !== "") {
            setTags([...tags, inputvalue.trim()]);
            setInputValue("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "enter") {
            addNewTag();
        }
    };
     

    const handleRmoveTag=(tagtoremove)=>{ 
        setTags(tags.filter((tag)=> tag !== tagtoremove));
    }

    return (
        <div>

           { tags?.length > 0 &&  (  <div className='flex items-center gap-2 flex-wrap mt-2'>
              {  tags.map( (tag,index)=>( 
                <span key={index} className='flex items-center gap-2 text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded'>
                # {tag}
                <button onClick={()=>{handleRmoveTag(tag)}}>
                <MdClose />
                </button>
                </span>
              )) }
            </div>
            )}

            <div className='flex items-center gap-4 mt-3'>
                <input
                value={inputvalue}
                    type="text"
                    placeholder='Add tags'
                    className='text-sm bg-transparent border px-3 py-2 rounded outline-none'
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
                <button className='w-8 h-8 flex items-center justify-center rounded border border-blue-700 hover:bg-blue-700'
                    onClick={() => { addNewTag(); }}
                >
                    <MdAdd className='text-2xl text-blue-700 hover:text-white' />
                </button>

            </div>
        </div>
    )
}

export default TagInput