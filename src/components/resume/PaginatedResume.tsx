import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ResumeTemplate } from './templates';
import { ResumeData } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Page dimensions - make it fill most of the screen
const PAGE_HORIZONTAL_MARGIN = 16;
const PAGE_VERTICAL_MARGIN = 20;
const HEADER_HEIGHT = 64; // Appbar height

// Calculate page dimensions to fit screen nicely
const AVAILABLE_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - (PAGE_VERTICAL_MARGIN * 2) - 60; // 60 for indicator
const PAGE_WIDTH = SCREEN_WIDTH - (PAGE_HORIZONTAL_MARGIN * 2);

// A4 aspect ratio: width:height = 1:1.414 (210mm x 297mm)
const A4_ASPECT_RATIO = 297 / 210; // 1.414

// Calculate page height based on width and A4 ratio
// But cap it to available screen height
const CALCULATED_HEIGHT = PAGE_WIDTH * A4_ASPECT_RATIO;
const PAGE_HEIGHT = Math.min(CALCULATED_HEIGHT, AVAILABLE_HEIGHT);

// Recalculate width if height was capped
const FINAL_PAGE_WIDTH = PAGE_HEIGHT < CALCULATED_HEIGHT 
  ? PAGE_HEIGHT / A4_ASPECT_RATIO 
  : PAGE_WIDTH;

// Original A4 at 72 DPI
const ORIGINAL_WIDTH = 595;
const ORIGINAL_HEIGHT = 842;

interface PaginatedResumeProps {
  templateId: string;
  data: ResumeData;
}

export function PaginatedResume({ templateId, data }: PaginatedResumeProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const measureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scale to fit our page width
  const scale = FINAL_PAGE_WIDTH / ORIGINAL_WIDTH;
  
  // One page height in original coordinates
  const originalPageHeight = ORIGINAL_HEIGHT;

  const handleMeasure = useCallback((event: any) => {
    const { height: measuredHeight } = event.nativeEvent.layout;
    
    if (measuredHeight > 0) {
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }

      measureTimeoutRef.current = setTimeout(() => {
        setContentHeight(measuredHeight);
        
        // Calculate pages based on original A4 page height
        const pages = Math.max(1, Math.ceil(measuredHeight / originalPageHeight));
        setTotalPages(pages);
        setIsReady(true);
        
        console.log('Measured:', { measuredHeight, pages, originalPageHeight, scale });
      }, 150);
    }
  }, [originalPageHeight, scale]);

  useEffect(() => {
    return () => {
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }
    };
  }, []);

  // Reset when data changes
  useEffect(() => {
    setIsReady(false);
    setContentHeight(0);
    setTotalPages(1);
    setCurrentPage(0);
  }, [data, templateId]);

  const handleScroll = useCallback((event: any) => {
    const pageWidth = FINAL_PAGE_WIDTH + (PAGE_HORIZONTAL_MARGIN * 2);
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / pageWidth);
    
    if (page >= 0 && page < totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  }, [totalPages, currentPage]);

  // Scaled page height for display
  const scaledPageHeight = originalPageHeight * scale;

  return (
    <View style={styles.container}>
      {/* Hidden measurement view */}
      <View style={styles.measureContainer} pointerEvents="none">
        <View 
          style={{ width: ORIGINAL_WIDTH, backgroundColor: '#ffffff' }}
          onLayout={handleMeasure}
        >
          <ResumeTemplate templateId={templateId} data={data} />
        </View>
      </View>

      {/* Main paginated display */}
      {isReady && contentHeight > 0 ? (
        <>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.scrollContent}
            decelerationRate="fast"
            snapToInterval={FINAL_PAGE_WIDTH + (PAGE_HORIZONTAL_MARGIN * 2)}
            snapToAlignment="center"
          >
            {Array.from({ length: totalPages }, (_, pageIndex) => {
              // Y offset in original coordinates
              const offsetY = pageIndex * originalPageHeight;
              
              return (
                <View 
                  key={`page-${pageIndex}`}
                  style={[
                    styles.pageWrapper, 
                    { 
                      width: FINAL_PAGE_WIDTH + (PAGE_HORIZONTAL_MARGIN * 2),
                      paddingHorizontal: PAGE_HORIZONTAL_MARGIN,
                    }
                  ]}
                >
                  {/* Page container with shadow */}
                  <View 
                    style={[
                      styles.page, 
                      { 
                        width: FINAL_PAGE_WIDTH, 
                        height: scaledPageHeight,
                      }
                    ]}
                  >
                    {/* Clip container */}
                    <View 
                      style={[
                        styles.clipContainer, 
                        { 
                          width: FINAL_PAGE_WIDTH, 
                          height: scaledPageHeight,
                        }
                      ]}
                    >
                      {/* Scaled content positioned for this page */}
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: ORIGINAL_WIDTH,
                          height: contentHeight,
                          backgroundColor: '#ffffff',
                          transform: [
                            { scale: scale },
                          ],
                          transformOrigin: 'top left',
                          marginTop: -offsetY * scale,
                        }}
                      >
                        <ResumeTemplate templateId={templateId} data={data} />
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Page indicator */}
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
          <ActivityIndicator size="large" color="#1a1a1a" />
          <Text style={styles.loadingText}>Preparing preview...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e7eb',
  },
  measureContainer: {
    position: 'absolute',
    top: -99999,
    left: -99999,
    opacity: 0,
    zIndex: -1,
  },
  scrollContent: {
    paddingVertical: PAGE_VERTICAL_MARGIN,
    alignItems: 'center',
  },
  pageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  page: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  clipContainer: {
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  pageIndicatorText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
});