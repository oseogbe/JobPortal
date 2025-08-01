import React, { useEffect, useRef, useCallback, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Quill from 'quill';

import BusinessSelect from '@/components/BusinessSelect';
import Spinner from '@/components/Spinner';
import { AuthContext } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';

import { JobCategories, JobLocations } from '@/assets/assets';

const AddJob = () => {
  const { accessToken } = useContext(AuthContext);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch,
    trigger
  } = useForm();

  const watchWorkMode = watch('workMode');
  const watchPaid = watch('isPaid');

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const handleBusinessChange = useCallback(
    (value) => {
      setValue('businessId', value);
    },
    [setValue]
  );

  useEffect(() => {
    if (watchWorkMode === 'Remote') {
      setValue('location', ''); // Reset location field when work mode is remote
    }
  }, [watchWorkMode, setValue]);

  useEffect(() => {
    if (watchPaid === 'false') {
      setValue('salary', ''); // Reset salary field when paid is false
    }
  }, [watchPaid, setValue]);

  useEffect(() => {
    // initiate quill once
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });

      // Register the 'description' field with RHF
      register('description', { required: 'Job description is required' });

      // Sync Quill content to RHF
      quillRef.current.on('text-change', () => {
        const html = quillRef.current.root.innerHTML;
        const plainText = quillRef.current.getText().trim();

        // Avoid storing empty <p><br></p> as valid input
        const isEmpty = plainText === '';

        setValue('description', isEmpty ? '' : html);
        trigger('description');
      });

      // Add Tailwind classes to the Quill toolbar
      const container = quillRef.current.root.parentElement;
      const toolbar = container.previousSibling;
      if (toolbar && toolbar.classList.contains('ql-toolbar')) {
        toolbar.classList.add('!border-2', '!border-gray-300', 'rounded-t');
      }
      // Add Tailwind classes to the Quill editor container
      container?.classList.add(
        '!border-2',
        '!border-gray-300',
        'rounded-b',
      );
      quillRef.current.root.style.minHeight = '10rem';
      quillRef.current.root.style.fontFamily = 'Outfit';
      quillRef.current.root.style.fontSize = '16px';
    }
  }, [editorRef, register, setValue, trigger]);

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...data,
          isPaid: data.isPaid === 'true', // Convert to boolean
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to post job');
      }

      toast.success('Job posted successfully!');
      navigate('/dashboard/manage-jobs');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container">
      <div className='w-full bg-white rounded-xl shadow max-sm:text-sm p-4'>
        <form className="md:grid gap-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="mb-2 font-medium">Job Title <span className="text-red-500">*</span></p>
              <input
                type="text"
                {...register('title', { required: 'Job title is required' })}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded"
                required
              />
              {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
            </div>

            <div className='max-sm:mb-6'>
              <p className="mb-2 font-medium">Business <span className="text-red-500">*</span></p>
              <BusinessSelect
                value={register('businessId', { required: 'Business is required' }).value}
                onChange={handleBusinessChange}
                required
              />
              {errors.businessId && <span className="text-xs text-red-500">{errors.businessId.message}</span>}
            </div>
          </div>

          <div className='max-sm:mb-6'>
            <p className="mb-2 font-medium">Job Category <span className="text-red-500">*</span></p>
            <select
              {...register('category', { required: 'Job category is required' })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded"
              required
            >
              <option value="">Select job category</option>
              {JobCategories.map((category, i) => (
                <option key={i} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && <span className="text-xs text-red-500">{errors.category.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="my-2 font-medium">Work Mode <span className="text-red-500">*</span></p>
              <select
                {...register('workMode', { required: 'Work mode is required' })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded"
                required
              >
                <option value="">Select work mode</option>
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              {errors.workMode && <span className="text-xs text-red-500">{errors.workMode.message}</span>}
            </div>

            <div className='max-sm:mb-6'>
              <p className="my-2 font-medium">Job Location</p>
              <select
                {...register('location')}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded"
                disabled={watchWorkMode === 'Remote'}
              >
                <option value="">Select job location</option>
                {JobLocations.map((location, i) => (
                  <option key={i} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              {errors.location && <span className="text-xs text-red-500">{errors.location.message}</span>}
            </div>
          </div>

          <div className='max-sm:mb-6'>
            <p className="my-2 font-medium">Job Level <span className="text-red-500">*</span></p>
            <select
              {...register('level', { required: 'Job level is required' })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded"
              required
            >
              <option value="">Select job level</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Junior Level">Junior Level</option>
              <option value="Intermediate Level">Intermediate Level</option>
              <option value="Senior Level">Senior Level</option>
              <option value="Management Level">Management Level</option>
              <option value="Director Level">Director Level</option>
              <option value="Executive Level">Executive Level</option>
            </select>
            {errors.level && <span className="text-xs text-red-500">{errors.level.message}</span>}
          </div>

          <div className='max-sm:mb-6'>
            <p className="my-2 font-medium">Job Type <span className="text-red-500">*</span></p>
            <select
              {...register('jobType', { required: 'Job type is required' })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded"
              required
            >
              <option value="">Select job type</option>
              <option value="fulltime">Full-time</option>
              <option value="parttime">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="temporary">Temporary</option>
              <option value="freelance">Freelance</option>
              <option value="volunteer">Volunteer</option>
            </select>
            {errors.jobType && <span className="text-xs text-red-500">{errors.jobType.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="my-2 font-medium">Paid or Unpaid <span className="text-red-500">*</span></p>
              <select
                {...register('isPaid', { required: 'This field is required' })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded"
                required
              >
                <option value="">Select</option>
                <option value="true">Paid</option>
                <option value="false">Unpaid</option>
              </select>
              {errors.isPaid && <span className="text-xs text-red-500">{errors.isPaid.message}</span>}
            </div>

            <div className='max-sm:mb-6'>
              <p className="my-2 font-medium">Job Salary <span className="text-red-500">*</span></p>
              <div className={`w-full flex items-center gap-2 px-4 py-2.5 md:py-1.5 rounded border-2 ${errors.salary ? 'border-red-500' : 'border-gray-300'}`}>
                <span className="text-gray-900 md:text-lg">₦</span>
                <input
                  type="number"
                  placeholder="0"
                  min={0}
                  {...register('salary', { required: 'Job salary is required' })}
                  className="w-full placeholder:text-gray-900"
                  disabled={watchPaid === 'false'}
                />
              </div>
              {errors.salary && <span className="text-xs text-red-500">{errors.salary.message}</span>}
            </div>
          </div>

          <div className="col-span-2 max-sm:mb-4 mb-20">
            <p className="my-2 font-medium">Job Description <span className="text-red-500">*</span></p>
            <div ref={editorRef}></div>
            {errors.description && (
              <span className="text-xs text-red-500">{errors.description.message}</span>
            )}
          </div>

          <button type="submit" className="md:max-w-xs col-span-2 px-6 py-3 bg-primary text-white rounded font-medium hover:bg-primary-dark transition mt-4" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddJob;
