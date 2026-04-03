import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, ArrowLeft, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const BulkUploadProduct = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const isValid = validExtensions.some(ext => selectedFile?.name.toLowerCase().endsWith(ext));

        if (selectedFile && isValid) {
            setFile(selectedFile);
            setResult(null);
        } else {
            alert('Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setResult(null); // Clear previous results

        try {
            const { data } = await api.post('/products/bulk-upload', formData);

            console.log('=== UPLOAD SUCCESS ===');
            console.log('Full response:', data);
            console.log('Success count:', data.successCount);
            console.log('Failed count:', data.failedCount);
            console.log('Errors:', data.errors);
            
            setResult(data);

            // Show success message
            if (data.successCount > 0) {
                alert(`Successfully uploaded ${data.successCount} product(s)!`);
            }

        } catch (error) {
            console.error('=== UPLOAD ERROR ===');
            console.error('Error object:', error);
            console.error('EXACT SERVER ERROR:', error.response?.data);
            console.error('Status code:', error.response?.status);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);

            const errorMessage = error.response?.data?.message || error.message || 'Failed to upload file';
            console.log('Final error message shown to user:', errorMessage);
            
            alert(`Upload failed: ${errorMessage}`);

            setResult({
                successCount: 0,
                failedCount: 0,
                errors: [{ error: errorMessage }]
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-12 bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    to="/my-shop"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to My Shop
                </Link>

                <h1 className="text-2xl font-bold text-slate-900 mb-6">Bulk Product Upload</h1>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-2">Instructions</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-1">
                            <li>Upload an Excel file (.xlsx, .xls) or CSV file (.csv) containing your products.</li>
                            <li>The first row must be the header row.</li>
                            <li>Required columns: <strong>name, price</strong>.</li>
                            <li>Optional columns: <strong>description, stock, category, subcategory, imageUrl, offerPrice</strong>.</li>
                            <li>For CSV files, use commas to separate values and quotes for text containing commas.</li>
                        </ul>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-primary transition-colors">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                            <FileSpreadsheet className={`w-16 h-16 mb-4 ${file ? 'text-green-500' : 'text-slate-400'}`} />
                            <span className="text-lg font-medium text-slate-700">
                                {file ? file.name : 'Click to upload Excel or CSV file'}
                            </span>
                            <span className="text-sm text-slate-500 mt-2">
                                {file ? 'Change file' : 'Supports .xlsx, .xls, and .csv formats'}
                            </span>
                        </label>
                    </div>

                    {file && (
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
                            >
                                {uploading ? (
                                    <>Uploading...</>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" /> Upload Products
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                {result.failedCount === 0 ? (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                ) : (
                                    <AlertCircle className="w-6 h-6 text-amber-500" />
                                )}
                                <h3 className="text-lg font-bold text-slate-900">Upload Summary</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                                    <div className="text-2xl font-bold text-slate-900">{result.successCount + result.failedCount}</div>
                                    <div className="text-xs text-slate-500 uppercase">Total Processed</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm text-center border-b-4 border-green-500">
                                    <div className="text-2xl font-bold text-green-600">{result.successCount}</div>
                                    <div className="text-xs text-slate-500 uppercase">Successful</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm text-center border-b-4 border-red-500">
                                    <div className="text-2xl font-bold text-red-600">{result.failedCount}</div>
                                    <div className="text-xs text-slate-500 uppercase">Failed</div>
                                </div>
                            </div>

                            {result.errors && result.errors.length > 0 && (
                                <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-4">
                                    <h4 className="font-bold text-red-800 mb-2">Error Details:</h4>
                                    <ul className="space-y-1 max-h-40 overflow-y-auto">
                                        {result.errors.map((err, idx) => (
                                            <li key={idx} className="text-sm text-red-700">
                                                Row {idx + 1}: {err.error} ({err.product?.name || 'Unknown Item'})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setResult(null);
                                    }}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Upload Another File
                                </button>
                                {result.successCount > 0 && (
                                    <button
                                        onClick={() => navigate('/my-shop')}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-sky-600 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Products
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkUploadProduct;
