import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Save, ToggleLeft, ToggleRight, Zap, Info } from 'lucide-react';

/**
 * ReservePickDiscountSettings
 * Embedded panel inside ShopSettings for shop owner to configure Reserve & Pick discounts.
 * Now a controlled component managed by ShopSettings.
 */
const ReservePickDiscountSettings = ({ settings, onChange }) => {
    const handleToggle = () => {
        onChange('isReservePickDiscountEnabled', !settings.isReservePickDiscountEnabled);
    };

    const handleValueChange = (field, value) => {
        onChange(field, value);
    };

    const previewDiscount = () => {
        const base = 100;
        let total = settings.isReservePickDiscountEnabled ? settings.reservePickDiscountPercentage : 0;
        const afterBase = base * (1 - total / 100);
        const afterBulk = afterBase * (1 - settings.bulkDiscountPercentage / 100);
        return { 
            afterBase: afterBase.toFixed(0), 
            afterBulk: afterBulk.toFixed(0), 
            totalBulk: (parseFloat(total) + parseFloat(settings.bulkDiscountPercentage)).toFixed(1) 
        };
    };

    const preview = previewDiscount();

    return (
        <div className="space-y-5">
            {/* Toggle */}
            <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                settings.isReservePickDiscountEnabled 
                    ? 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200' 
                    : 'bg-slate-50 border-slate-200'
            }`}>
                <div>
                    <p className={`font-bold ${settings.isReservePickDiscountEnabled ? 'text-slate-900' : 'text-slate-500'}`}>
                        Reserve & Pick Discount
                    </p>
                    <p className="text-sm text-slate-500">Offer customers an instant discount when they reserve and pick up from your shop</p>
                </div>
                <button
                    onClick={handleToggle}
                    type="button"
                    className="flex-shrink-0 ml-4 transition-transform active:scale-95"
                    title="Toggle Reserve & Pick discount"
                >
                    {settings.isReservePickDiscountEnabled
                        ? <ToggleRight className="w-12 h-12 text-primary" strokeWidth={1.5} />
                        : <ToggleLeft className="w-12 h-12 text-slate-300" strokeWidth={1.5} />
                    }
                </button>
            </div>

            {/* Settings (only when enabled) */}
            <motion.div
                animate={{ 
                    opacity: settings.isReservePickDiscountEnabled ? 1 : 0.5, 
                    pointerEvents: settings.isReservePickDiscountEnabled ? 'auto' : 'none',
                    y: settings.isReservePickDiscountEnabled ? 0 : -10
                }}
                className="space-y-5"
            >
                {/* Base Discount % */}
                <div className="glass-card p-4 border border-slate-100">
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                        <Tag className="w-4 h-4 inline mr-1 text-primary" />
                        Base Reservation Discount (%)
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="1"
                            max="50"
                            step="0.5"
                            value={settings.reservePickDiscountPercentage}
                            onChange={e => handleValueChange('reservePickDiscountPercentage', parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="w-20 px-4 py-2 border border-slate-200 rounded-lg text-center font-bold text-primary bg-white shadow-sm">
                            {settings.reservePickDiscountPercentage}%
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Customer pays ₹{preview.afterBase} for every ₹100 product (excluding bulk)
                    </p>
                </div>

                {/* Bulk Discount */}
                <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                            <Zap className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h4 className="font-bold text-slate-800">Bulk Quantity Bonus</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Minimum Items</label>
                            <input
                                type="number"
                                min="2"
                                max="100"
                                value={settings.bulkDiscountMinItems}
                                onChange={e => handleValueChange('bulkDiscountMinItems', parseInt(e.target.value) || 2)}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all shadow-sm"
                            />
                            <p className="text-[10px] text-slate-400 mt-1.5">Applies when {settings.bulkDiscountMinItems} or more items are reserved</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Extra Discount (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="30"
                                step="0.5"
                                value={settings.bulkDiscountPercentage}
                                onChange={e => handleValueChange('bulkDiscountPercentage', parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all shadow-sm"
                            />
                            <p className="text-[10px] text-slate-400 mt-1.5">Additional discount stacked on top of base</p>
                        </div>
                    </div>

                    {/* Bulk tier preview */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-100">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-emerald-100/50 shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1 select-none">Under {settings.bulkDiscountMinItems} items</p>
                            <div className="text-xl font-black text-primary">{settings.reservePickDiscountPercentage}%</div>
                            <p className="text-[10px] text-slate-400 font-medium">Standard Savings</p>
                        </div>
                        <div className="bg-emerald-500 rounded-xl p-3 text-center shadow-lg shadow-emerald-200">
                            <p className="text-[10px] font-bold text-white/70 uppercase tracking-tighter mb-1 select-none">{settings.bulkDiscountMinItems}+ items</p>
                            <div className="text-xl font-black text-white">{preview.totalBulk}%</div>
                            <p className="text-[10px] text-white/80 font-medium">Bulk Savings</p>
                        </div>
                    </div>
                </div>
            </motion.div>
            
            <p className="text-xs text-center text-slate-400 italic">
                Note: Don't forget to click the main "Save Changes" button below.
            </p>
        </div>
    );
};

export default ReservePickDiscountSettings;
