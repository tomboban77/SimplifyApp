import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useState, useRef, useEffect } from 'react';
import { ResumeTemplate } from './templates';
import { ResumeData } from '@/types';

const { width } = Dimensions.get('window');
const PAGE_MARGIN = 16;
const A4_WIDTH = width - (PAGE_MARGIN * 2);
const A4_HEIGHT = (A4_WIDTH * 11) / 8.5; // A4 aspect ratio

interface PaginatedResumeProps {
  templateId: string;
  data: ResumeData;
}

export function PaginatedResume({ templateId, data }: PaginatedResumeProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isMeasuring, setIsMeasuring] = useState(true);
  const measureRef = useRef<View>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setContentHeight(height);
        const calculatedPages = Math.max(1, Math.ceil(height / A4_HEIGHT));
        setTotalPages(calculatedPages);
        setIsMeasuring(false);
      }, 200);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Hidden measurement view - must match display exactly */}
      <View style={styles.measureWrapper} collapsable={false}>
        <View
          ref={measureRef}
          onLayout={handleContentLayout}
          style={[styles.measureContent, { width: A4_WIDTH }]}
        >
          <ResumeTemplate templateId={templateId} data={data} />
        </View>
      </View>

      {/* Paginated display */}
      {!isMeasuring && contentHeight > 0 ? (
        <>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const pageWidth = A4_WIDTH + (PAGE_MARGIN * 2);
              const page = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
              if (page >= 0 && page < totalPages) {
                setCurrentPage(page);
              }
            }}
            scrollEventThrottle={16}
            contentContainerStyle={styles.scrollContent}
          >
            {Array.from({ length: totalPages }, (_, index) => {
              // Calculate the Y offset for this page
              // Page 0: offset = 0 (show from top)
              // Page 1: offset = -A4_HEIGHT (show content starting from A4_HEIGHT)
              // Page 2: offset = -2*A4_HEIGHT (show content starting from 2*A4_HEIGHT)
              const offsetY = -index * A4_HEIGHT;
              
              return (
                <View 
                  key={`page-${index}`}
                  style={[styles.pageContainer, { width: A4_WIDTH + (PAGE_MARGIN * 2) }]}
                >
                  <View style={[styles.page, { width: A4_WIDTH, height: A4_HEIGHT }]}>
                    {/* This container clips the content to page height */}
                    <View style={[styles.clipView, { width: A4_WIDTH, height: A4_HEIGHT }]}>
                      {/* This wrapper contains the full content and is positioned */}
                      <View
                        style={[
                          styles.contentContainer,
                          {
                            width: A4_WIDTH,
                            height: contentHeight,
                            position: 'absolute',
                            top: offsetY,
                            left: 0,
                          },
                        ]}
                      >
                        <ResumeTemplate templateId={templateId} data={data} />
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {totalPages > 1 && (
            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                {currentPage + 1} / {totalPages}
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9ecef',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  measureWrapper: {
    position: 'absolute',
    opacity: 0,
    width: A4_WIDTH,
    pointerEvents: 'none',
    zIndex: -1,
    top: -99999,
    left: 0,
  },
  measureContent: {
    width: A4_WIDTH,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  pageContainer: {
    paddingHorizontal: PAGE_MARGIN,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 16,
  },
  page: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  clipView: {
    overflow: 'hidden',
    position: 'relative',
  },
  contentContainer: {
    width: A4_WIDTH,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pageIndicatorText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
