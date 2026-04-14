"use client";

import React, { useState, useRef, useEffect } from "react";
import { Popover, Button, Spin } from "antd";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { lookupWord } from "../services/vocabService";
import { handleProblems } from '@/share/utils/functions';
import { userVocabularyService } from "../services/user_vocabulary/user-vocabulary.service";
import messageService from '@/share/services/messageService';

type LookupResult = {
     word: string;
     phonetics?: Array<any>;
     meanings?: Array<any>;
};

interface VocabProviderProps {
     children: React.ReactNode;
     disabled?: boolean;
}

export default function VocabProvider({ children, disabled = false }: VocabProviderProps) {
     const containerRef = useRef<HTMLDivElement | null>(null);
     const [selectedWord, setSelectedWord] = useState<string | null>(null);
     const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
     const [showPopover, setShowPopover] = useState(false);
     const [lookup, setLookup] = useState<LookupResult | null>(null);
     const [loading, setLoading] = useState(false);
     const [saving, setSaving] = useState(false);
     const selectedWrapperRef = useRef<HTMLElement | null>(null);

     useEffect(() => {
          if (disabled) return;
          
          const el = containerRef.current ?? document;

          const handleDblClick = (e: MouseEvent) => {
               const sel = window.getSelection();
               if (!sel) return;
               const text = sel.toString().trim();
               if (!text) return;

               const matched = text.match(/[\p{L}0-9'’-]+/u);
               const word = matched ? matched[0] : text.split(/\s+/)[0];
               if (!word) return;

               const range = sel.rangeCount ? sel.getRangeAt(0) : null;
               const rect = range ? range.getBoundingClientRect() : null;

               // remove any previous temp highlight
               if (selectedWrapperRef.current) {
                    const prev = selectedWrapperRef.current;
                    const parent = prev.parentNode;
                    while (prev.firstChild) parent?.insertBefore(prev.firstChild, prev);
                    parent?.removeChild(prev);
                    selectedWrapperRef.current = null;
               }

               setSelectedWord(word);
               setAnchor(rect ? { x: rect.left + rect.width / 2, y: rect.top } : { x: e.clientX, y: e.clientY });
               setShowPopover(false);
               setLookup(null);

               // try to wrap selection with a temporary highlight span
               try {
                    if (range) {
                         const span = document.createElement('span');
                         span.style.backgroundColor = 'rgba(254, 243, 199, 0.9)';
                         span.style.borderRadius = '2px';
                         span.style.transition = 'background-color 0.15s ease';
                         span.setAttribute('data-vocab-temp', 'true');
                         range.surroundContents(span);
                         selectedWrapperRef.current = span as HTMLElement;
                         // update anchor to be relative to newly inserted span (more accurate)
                         const newRect = span.getBoundingClientRect();
                         setAnchor({ x: newRect.left + newRect.width / 2, y: newRect.top });
                    }
               } catch (err) {
                    // wrapping can fail if selection crosses nodes — ignore
                    console.debug('Could not apply temp highlight', err);
               }

               setTimeout(() => {
                    setShowPopover(true);
                    fetchLookup(word);
               }, 100);
          };

          el.addEventListener("dblclick", handleDblClick as any);
          return () => el.removeEventListener("dblclick", handleDblClick as any);
     }, [disabled]);

     const fetchLookup = async (word: string) => {
          setLoading(true);
          try {
               const res = await lookupWord(word);
               setLookup(res);
          } catch (err) {
               console.error(err);
               messageService.notifyError("Không tìm thấy từ hoặc lỗi kết nối");
          } finally {
               setLoading(false);
          }
     };

     const handleSave = async () => {
          if (!selectedWord || !lookup) return;
          setSaving(true);
          try {
               await userVocabularyService.saveVocab({ word: selectedWord, data: lookup });
               console.debug('VocabProvider: save succeeded');
               messageService.notifySuccess('Đã lưu từ vựng');
          } catch (err) {
               console.error('VocabProvider: save failed', err);
               // Use centralized handler so backend codes are localized
               try { handleProblems(err); } catch (e) { messageService.notifyError('Lưu thất bại'); }
          } finally {
               setSaving(false);
               setShowPopover(false);
          }
     };

     // cleanup highlight when popover closes
     useEffect(() => {
          if (!showPopover && selectedWrapperRef.current) {
               const span = selectedWrapperRef.current;
               const parent = span.parentNode;
               while (span.firstChild) parent?.insertBefore(span.firstChild, span);
               parent?.removeChild(span);
               selectedWrapperRef.current = null;
          }
     }, [showPopover]);

     const popoverContent = (
          <div style={{ minWidth: 320, maxWidth: '33vw' }}>
               {loading ? (
                    <div className="py-6 flex justify-center"><Spin /></div>
               ) : lookup ? (
                    <div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                   <strong style={{ fontSize: 16 }}>{lookup.word}</strong>
                                   {lookup.phonetics && lookup.phonetics.length > 0 && (
                                        <div className="text-sm text-gray-500">{lookup.phonetics.map(p => p.text).filter(Boolean).join(' • ')}</div>
                                   )}
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                   <Button size="small" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>Lưu</Button>
                                   <Button size="small" icon={<CloseOutlined />} onClick={() => setShowPopover(false)} />
                              </div>
                         </div>

                         <div style={{ marginTop: 8 }}>
                              {lookup.meanings?.map((m, mi) => (
                                   <div key={mi} style={{ marginBottom: 8 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600 }}>{m.partOfSpeech}</div>
                                        {m.definitions?.slice(0, 3).map((d: any, di: number) => (
                                             <div key={di} style={{ fontSize: 13, marginTop: 4 }}>
                                                  - {d.definition}
                                                  {d.example && <div style={{ fontSize: 12, color: '#666' }}>&quot;{d.example}&quot;</div>}
                                             </div>
                                        ))}
                                   </div>
                              ))}
                         </div>
                    </div>
               ) : (
                    <div className="text-sm text-gray-500">Không có dữ liệu</div>
               )}
          </div>
     );

     return (
          <div ref={containerRef} style={{ position: 'relative' }}>
               {children}

               {anchor && selectedWord && (
                    // position the popover close to selection (slightly above)
                    <div style={{ position: 'fixed', left: anchor.x, top: Math.max(8, anchor.y - 8), transform: 'translate(-50%, -100%)', zIndex: 9999 }}>
                         <Popover
                              open={showPopover}
                              content={popoverContent}
                              title={null}
                              trigger="click"
                              placement="topLeft"
                              onOpenChange={(open) => setShowPopover(open)}
                         >
                              {/* Invisible anchor element positioned over the selected text so popover appears directly above it */}
                              <span style={{ display: 'block', width: 8, height: 8 }} aria-hidden />
                         </Popover>
                    </div>
               )}
          </div>
     );
}
