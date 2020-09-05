import Link from 'next/link'
import {useEffect, useState} from 'react'
import Router from 'next/router'
import dynamic from 'next/dynamic'
import {withRouter} from 'next/router'
import {getCookie, isAuth} from '../../actions/auth'
import {getCategories } from '../../actions/category'
import {getTags } from '../../actions/tags'
import {createBlog} from '../../actions/blog'
import '../../node_modules/react-quill/dist/quill.snow.css'
const ReactQuill = dynamic(()=> import('react-quill'), {ssr: false})
const CreateBlog=({router})=>{

    const blogFromLS=()=>{
        if(typeof window === 'undefined'){
            return false
        }
        if(localStorage.getItem('blog')){
            return JSON.parse(localStorage.getItem('blog'))
        } else{
            return false
        }
    }



    const [body, setBody]=useState(blogFromLS())
    const [values, setValues]=useState({
        error:'',
        sizeError:'',
        success:'',
        formData:'',
        title: '',
        hidePublishButton: false
    })
    const[checked, setChecked]= useState([])
    const[checkedTag, setCheckedTag]= useState([])
    

    const handleToggle=(c)=>()=>{
        setValues({...values, error: ''})
        const clickedCategory= checked.indexOf(c)
        const all =[...checked]

        if(clickedCategory=== -1){
            all.push(c)
        }else{
            all.splice(clickedCategory, 1)
        }

        console.log(all)
        setChecked(all)

        formData.set('categories', all)

    }
    const showCategories=()=>{
        return (
            categories && categories.map((c,ic)=>(
                <li className="list-unstyled" key={ic}>
                    <input onChange={handleToggle(c._id)} type="checkbox" className="mr-2"/>
                    <label className="form-check-label">{c.name}</label>
                </li>
            ))
        )
    }

    const showTags=()=>{
        return (
            tags && tags.map((t,it)=>(
                <li className="list-unstyled" key={it}>
                    <input type="checkbox" className="mr-2"/>
                    <label className="form-check-label">{t.name}</label>
                </li>
            ))
        )
    }

    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])


    const {error, sizeError, success, formData, title, hidePublishButton}= values

    const initCategories=()=>{
        getCategories().then(data=>{
            if(data.error){
                setValues({...values, error: data.error})
            }else{
                setCategories(data)
            }
        })

    }

    const initTags=()=>{
        getTags().then(data=>{
            if(data.error){
                setValues({...values, error: data.error})
            }else{
                setTags(data)
            }
        })
    }

    useEffect(()=>{
        setValues({...values, formData: new FormData()})
        initCategories()
        initTags()
    },[router])

    const handleChange= name=>e=>{
        // console.log(e.target.value)
        const value= name === 'photo'? e.target.files[0] : e.target.value
        formData.set(name, value)
        setValues({...values, [name]: value, formData, error:''})

    }
    const publishBlog=(e)=>{
        e.preventDefault()
        console.log('Ready to Publish')
    }

    const handleBody=e=>{
        // console.log(e)
        setBody(e)
        formData.set('body', e)
        if(typeof window !== undefined){
            localStorage.setItem('blog', JSON.stringify(e))
        }
    }


    const createBlogForm=()=>{
        return(
            <form onSubmit={publishBlog}>
                <div className="form-group">
                    <label className="text-muted">Title</label>
                    <input type="text" className="form-control" value={title} onChange={handleChange('title')}/>
                </div>
                <div className="form-group">
                    <ReactQuill modules={CreateBlog.modules} formats={CreateBlog.formats} value={body} placeholder="Hii," onChange={handleBody}/>
                </div>
                <div>
                    <button className="btn btn-primary" type="submit">Publish</button>
                </div>
            </form>
        )
    }


    return  <div className="container-fluid">
                <div className="row">
                   <div className="col-md-8">
                        {createBlogForm()}
                    </div> 
                    <div className="col-md-4">
                        <div >
                            <h5>
                                Categories
                            </h5>
                            <hr />
                            <ul style={{maxHeight:'150px', overflowY: 'scroll'}}>
                               {showCategories()}  
                            </ul>
                        </div>
                        <hr />
                        <div >
                            <h5>
                                Tags
                            </h5>
                            <hr />
                            <ul style={{maxHeight:'150px', overflowY: 'scroll'}}>
                                {showTags()}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
}

CreateBlog.modules={

    toolbar:[
        [{header:'1'},{header:'2'}, {header: [3,4,5,6]},{font:[]}],
        [{size: []}],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'video'],
        ['clean'],
        ['code-block']
    ]
}

CreateBlog.formats=[
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'link',
    'image',
    'video',
    'code-block'
]

export default withRouter(CreateBlog)