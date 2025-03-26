import React, { useState } from 'react';
import { X, Download, Upload, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Papa from 'papaparse';

interface ImportInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ImportRow {
  'Product Name': string;
  'Product Code (SKU)': string;
  'Category': string;
  'Vendor': string;
  'Purchase Cost': string;
  'Sale Price': string;
  'Current Stock': string;
  'Minimum Stock Level': string;
  'Web Link': string;
  'Image URL': string;
}

interface ValidationError {
  row: number;
  errors: string[];
}

export default function ImportInventoryModal({
  isOpen,
  onClose,
  onImportComplete,
}: ImportInventoryModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [previewData, setPreviewData] = useState<ImportRow[]>([]);
  const [importStats, setImportStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
  });

  const downloadTemplate = () => {
    const headers = [
      'Product Name',
      'Product Code (SKU)',
      'Category',
      'Vendor',
      'Purchase Cost',
      'Sale Price',
      'Current Stock',
      'Minimum Stock Level',
      'Web Link',
      'Image URL'
    ];

    const csvContent = Papa.unparse({
      fields: headers,
      data: [
        [
          'Example Product',
          'SKU123',
          'Electronics',
          'Example Vendor',
          '100.00',
          '150.00',
          '10',
          '5',
          'https://example.com/product',
          'https://example.com/image.jpg'
        ]
      ]
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'inventory_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateRow = (row: ImportRow, index: number): string[] => {
    const errors: string[] = [];

    // Required fields
    if (!row['Product Name']) errors.push('Product Name is required');
    if (!row['Category']) errors.push('Category is required');
    
    // Numeric validations
    const cost = parseFloat(row['Purchase Cost']);
    if (isNaN(cost) || cost < 0) errors.push('Purchase Cost must be a positive number');
    
    const price = parseFloat(row['Sale Price']);
    if (isNaN(price) || price < 0) errors.push('Sale Price must be a positive number');
    
    const stock = parseInt(row['Current Stock']);
    if (isNaN(stock) || stock < 0) errors.push('Current Stock must be a non-negative number');
    
    const minStock = parseInt(row['Minimum Stock Level']);
    if (isNaN(minStock) || minStock < 0) errors.push('Minimum Stock Level must be a non-negative number');

    // URL validations
    if (row['Web Link'] && !isValidUrl(row['Web Link'])) {
      errors.push('Invalid Web Link URL');
    }
    if (row['Image URL'] && !isValidUrl(row['Image URL'])) {
      errors.push('Invalid Image URL');
    }

    return errors;
  };

  const isValidUrl = (url: string): boolean => {
    if (!url) return true; // Empty URLs are allowed
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        alert('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      validateFile(selectedFile);
    }
  };

  const validateFile = (file: File) => {
    setIsValidating(true);
    setValidationErrors([]);
    setPreviewData([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy', // Skip empty lines
      complete: async (results) => {
        const data = results.data as ImportRow[];
        const errors: ValidationError[] = [];
        
        // Validate headers
        const requiredHeaders = [
          'Product Name',
          'Product Code (SKU)',
          'Category',
          'Vendor',
          'Purchase Cost',
          'Sale Price',
          'Current Stock',
          'Minimum Stock Level',
          'Web Link',
          'Image URL'
        ];

        const missingHeaders = requiredHeaders.filter(
          header => !results.meta.fields?.includes(header)
        );

        if (missingHeaders.length > 0) {
          alert(`Missing required columns: ${missingHeaders.join(', ')}`);
          setFile(null);
          setIsValidating(false);
          return;
        }

        // Check for duplicate SKUs
        const existingSkus = new Set<string>();
        const { data: dbSkus } = await supabase
          .from('inventory_items')
          .select('sku')
          .not('sku', 'is', null);

        dbSkus?.forEach(item => {
          if (item.sku) existingSkus.add(item.sku.toLowerCase());
        });

        // Validate each row
        data.forEach((row, index) => {
          const rowErrors = validateRow(row, index);
          
          // Check for duplicate SKUs
          if (row['Product Code (SKU)']) {
            const sku = row['Product Code (SKU)'].toLowerCase();
            if (existingSkus.has(sku)) {
              rowErrors.push(`SKU "${row['Product Code (SKU)']}" already exists in the database`);
            } else {
              existingSkus.add(sku);
            }
          }

          if (rowErrors.length > 0) {
            errors.push({
              row: index + 2, // +2 for header row and 1-based indexing
              errors: rowErrors,
            });
          }
        });

        setValidationErrors(errors);
        setPreviewData(data);
        setIsValidating(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the file format.');
        setFile(null);
        setIsValidating(false);
      }
    });
  };

  const handleImport = async () => {
    if (!file || validationErrors.length > 0) return;
    
    setIsImporting(true);
    setImportStats({ total: previewData.length, success: 0, failed: 0 });

    try {
      for (const row of previewData) {
        try {
          // First check/create vendor
          let vendorId = null;
          if (row['Vendor']) {
            // Create vendor if it doesn't exist
            const { data: vendor, error: vendorError } = await supabase
              .from('inventory_vendors')
              .insert([{ name: row['Vendor'] }])
              .select()
              .single();

            if (vendorError && vendorError.code === '23505') { // Unique violation
              // Vendor already exists, get their ID
              const { data: existingVendor } = await supabase
                .from('inventory_vendors')
                .select('id')
                .eq('name', row['Vendor'])
                .single();
              
              if (existingVendor) {
                vendorId = existingVendor.id;
              }
            } else if (vendorError) {
              throw vendorError;
            } else {
              vendorId = vendor.id;
            }
          }

          // Create inventory item
          const { error: itemError } = await supabase
            .from('inventory_items')
            .insert([{
              name: row['Product Name'],
              sku: row['Product Code (SKU)'] || null,
              category: row['Category'],
              vendor_id: vendorId,
              unit_price: parseFloat(row['Sale Price']),
              cost_price: parseFloat(row['Purchase Cost']),
              quantity: parseInt(row['Current Stock']),
              min_quantity: parseInt(row['Minimum Stock Level']),
              web_link: row['Web Link'] || null,
              image_url: row['Image URL'] || null,
            }]);

          if (itemError) throw itemError;
          
          setImportStats(prev => ({ ...prev, success: prev.success + 1 }));
        } catch (error) {
          console.error('Error importing row:', error);
          setImportStats(prev => ({ ...prev, failed: prev.failed + 1 }));
        }
      }

      onImportComplete();
      onClose();
    } catch (error) {
      console.error('Error during import:', error);
      alert('An error occurred during import. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Import Inventory</h2>
            <p className="text-sm text-gray-500">Import items from a CSV file</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Get Started</h3>
            <p className="text-sm text-blue-600 mb-3">
              Download our template file to ensure your data is formatted correctly.
            </p>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-3 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {/* Validation Results */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <h3 className="text-sm font-medium text-red-800">
                  Validation Errors Found
                </h3>
              </div>
              <div className="space-y-2">
                {validationErrors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700">
                    <p className="font-medium">Row {error.row}:</p>
                    <ul className="list-disc list-inside pl-4">
                      {error.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Preview ({previewData.length} items)
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Product Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        SKU
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Category
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Stock
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {row['Product Name']}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {row['Product Code (SKU)']}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {row['Category']}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {row['Current Stock']}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          ${row['Sale Price']}
                        </td>
                      </tr>
                    ))}
                    {previewData.length > 5 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-sm text-gray-500 text-center">
                          ... and {previewData.length - 5} more items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Progress */}
          {isImporting && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-800">
                  Importing...
                </h3>
                <span className="text-sm text-blue-600">
                  {importStats.success + importStats.failed} of {importStats.total}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((importStats.success + importStats.failed) / importStats.total) * 100}%`
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-blue-600">
                <span>{importStats.success} successful</span>
                <span>{importStats.failed} failed</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isImporting}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || validationErrors.length > 0 || isImporting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 flex items-center"
            >
              {isImporting ? (
                <>
                  <Upload className="w-5 h-5 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Import
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}