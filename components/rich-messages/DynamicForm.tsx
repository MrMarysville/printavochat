"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Send, AlertCircle, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'select' 
  | 'textarea' 
  | 'date' 
  | 'toggle' 
  | 'file'
  | 'multiselect'
  | 'price'
  | 'color';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{
    value: string;
    label: string;
  }>;
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  validation?: {
    pattern?: string;
    message?: string;
  };
}

export interface DynamicFormProps {
  fields: FormField[];
  title?: string;
  description?: string;
  submitButtonText?: string;
  onSubmit: (_values: Record<string, any>) => void;
  onCancel?: () => void;
  initialValues?: Record<string, any>;
  isLoading?: boolean;
  collapsible?: boolean;
}

export function DynamicForm({
  fields,
  title = 'Form',
  description,
  submitButtonText = 'Submit',
  onSubmit,
  onCancel,
  initialValues = {},
  isLoading = false,
  collapsible = false
}: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleChange = (fieldId: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
    
    // Mark field as touched
    if (!touched[fieldId]) {
      setTouched(prev => ({ ...prev, [fieldId]: true }));
    }
    
    // Clear error if field was previously in error
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = values[field.id];
      
      // Check required fields
      if (field.required && (value === undefined || value === null || value === '')) {
        newErrors[field.id] = `${field.label} is required`;
      }
      
      // Check patterns
      if (value && field.validation?.pattern) {
        const pattern = new RegExp(field.validation.pattern);
        if (!pattern.test(String(value))) {
          newErrors[field.id] = field.validation.message || `Invalid ${field.label.toLowerCase()}`;
        }
      }
      
      // Check min/max for number fields
      if (field.type === 'number' && value !== undefined && value !== '') {
        const numValue = Number(value);
        if (field.min !== undefined && numValue < field.min) {
          newErrors[field.id] = `Value must be at least ${field.min}`;
        }
        if (field.max !== undefined && numValue > field.max) {
          newErrors[field.id] = `Value must be at most ${field.max}`;
        }
      }
    });
    
    setErrors(newErrors);
    // Mark all fields as touched on validation
    const allTouched = fields.reduce((acc, field) => {
      acc[field.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouched(allTouched);
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(values);
    }
  };

  const renderField = (field: FormField) => {
    const { id, type, label, placeholder, required, options, min, max, step, description } = field;
    const value = values[id] !== undefined ? values[id] : field.defaultValue || '';
    const hasError = !!errors[id] && touched[id];
    
    switch (type) {
      case 'text':
      case 'email':
        return (
          <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {description && (
              <p className="text-xs text-gray-500 mb-1">{description}</p>
            )}
            <Input
              id={id}
              type={type}
              value={value}
              onChange={e => handleChange(id, e.target.value)}
              placeholder={placeholder}
              className={hasError ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {hasError && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors[id]}
              </p>
            )}
          </div>
        );
        
      case 'textarea':
        return (
          <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {description && (
              <p className="text-xs text-gray-500 mb-1">{description}</p>
            )}
            <textarea
              id={id}
              value={value}
              onChange={e => handleChange(id, e.target.value)}
              placeholder={placeholder}
              className={`w-full px-3 py-2 border rounded-md ${hasError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-primary`}
              rows={4}
              disabled={isLoading}
            />
            {hasError && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors[id]}
              </p>
            )}
          </div>
        );
        
      case 'number':
      case 'price':
        return (
          <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {description && (
              <p className="text-xs text-gray-500 mb-1">{description}</p>
            )}
            <div className={`relative ${type === 'price' ? 'flex items-center' : ''}`}>
              {type === 'price' && (
                <span className="absolute left-3 text-gray-500">$</span>
              )}
              <Input
                id={id}
                type="number"
                value={value}
                onChange={e => handleChange(id, e.target.value)}
                placeholder={placeholder}
                min={min}
                max={max}
                step={step || 1}
                className={`${hasError ? 'border-red-500' : ''} ${type === 'price' ? 'pl-7' : ''}`}
                disabled={isLoading}
              />
            </div>
            {hasError && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors[id]}
              </p>
            )}
          </div>
        );
        
      case 'select':
        return (
          <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {description && (
              <p className="text-xs text-gray-500 mb-1">{description}</p>
            )}
            <select
              id={id}
              value={value}
              onChange={e => handleChange(id, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${hasError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-primary`}
              disabled={isLoading}
            >
              <option value="">Select {label}</option>
              {options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {hasError && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors[id]}
              </p>
            )}
          </div>
        );
        
      case 'date':
        return (
          <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {description && (
              <p className="text-xs text-gray-500 mb-1">{description}</p>
            )}
            <Input
              id={id}
              type="date"
              value={value}
              onChange={e => handleChange(id, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {hasError && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors[id]}
              </p>
            )}
          </div>
        );
        
      case 'toggle':
        return (
          <div className="mb-4 flex items-center">
            <input
              id={id}
              type="checkbox"
              checked={!!value}
              onChange={e => handleChange(id, e.target.checked)}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              disabled={isLoading}
            />
            <label htmlFor={id} className="ml-2 block text-sm text-gray-700">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {description && (
              <div className="ml-2 relative -top-0.5">
                <span title={description}>
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                </span>
              </div>
            )}
          </div>
        );
        
      case 'multiselect':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {description && (
              <p className="text-xs text-gray-500 mb-1">{description}</p>
            )}
            <div className={`border rounded-md ${hasError ? 'border-red-500' : 'border-gray-300'}`}>
              {options?.map(option => (
                <div key={option.value} className="flex items-center px-3 py-2 border-b last:border-b-0">
                  <input
                    id={`${id}.${option.value}`}
                    type="checkbox"
                    value={option.value}
                    checked={Array.isArray(value) && value.includes(option.value)}
                    onChange={e => {
                      const newValue = Array.isArray(value) ? [...value] : [];
                      if (e.target.checked) {
                        newValue.push(option.value);
                      } else {
                        const index = newValue.indexOf(option.value);
                        if (index !== -1) newValue.splice(index, 1);
                      }
                      handleChange(id, newValue);
                    }}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    disabled={isLoading}
                  />
                  <label htmlFor={`${id}.${option.value}`} className="ml-2 block text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {hasError && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors[id]}
              </p>
            )}
          </div>
        );
        
      case 'color':
        return (
          <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {description && (
              <p className="text-xs text-gray-500 mb-1">{description}</p>
            )}
            <div className="flex items-center">
              <input
                id={id}
                type="color"
                value={value || '#000000'}
                onChange={e => handleChange(id, e.target.value)}
                className={`h-10 w-10 border-0 p-0 ${hasError ? 'ring-1 ring-red-500' : ''}`}
                disabled={isLoading}
              />
              <Input
                type="text"
                value={value || ''}
                onChange={e => handleChange(id, e.target.value)}
                placeholder="#000000"
                className="ml-2 w-32"
                disabled={isLoading}
              />
            </div>
            {hasError && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors[id]}
              </p>
            )}
          </div>
        );
        
      case 'file':
        // This is a simplified version - ideally integrate with the FileUpload component
        return (
          <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {description && (
              <p className="text-xs text-gray-500 mb-1">{description}</p>
            )}
            <input
              id={id}
              type="file"
              onChange={e => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  handleChange(id, files[0]);
                }
              }}
              className="block w-full text-sm text-gray-500 
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-primary file:text-white
                hover:file:bg-primary/90"
              disabled={isLoading}
            />
            {hasError && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors[id]}
              </p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (collapsible && isCollapsed) {
    return (
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsCollapsed(false)}>
          <h3 className="font-medium">{title}</h3>
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className={`p-4 flex justify-between items-center border-b ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? () => setIsCollapsed(true) : undefined}>
        <div>
          <h3 className="font-medium">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        {collapsible && <ChevronUp className="h-5 w-5 text-gray-400" />}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4">
        {fields.map(field => renderField(field))}
        
        <div className="flex justify-end mt-4 gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            {isLoading ? 'Processing...' : submitButtonText}
            {!isLoading && <Send className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </form>
    </div>
  );
} 