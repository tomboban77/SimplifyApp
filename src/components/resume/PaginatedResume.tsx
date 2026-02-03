import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useState, useRef } from 'react';
import { ResumeTemplate } from './templates';
import { ResumeData } from '@/types';

const { width } = Dimensions.get('window');
const PAGE_MARGIN = 16;
const A4_WIDTH = width - (PAGE_MARGIN * 2);
const A4_HEIGHT = (A4_WIDTH * 11) / 8.5; // A4 aspect ratio
const PAGE_BUFFER = 20; // Extra buffer to prevent text cut-off
const SAFE_PAGE_HEIGHT = A4_HEIGHT - PAGE_BUFFER;

interface PaginatedResumeProps {
  templateId: string;
  data: ResumeData;
}

export function PaginatedResume({ templateId, data }: PaginatedResumeProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const contentRef = useRef<View>(null);

  const handleContentLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && height !== contentHeight) {
      // Add small delay to ensure measurement is complete
      setTimeout(() => {
        setContentHeight(height);
        const calculatedPages = Math.max(1, Math.ceil(height / SAFE_PAGE_HEIGHT));
        setTotalPages(calculatedPages);
      }, 50);
    }
  };

  return (
    <View style={styles.container}>
      {/* Measurement view - must render exactly the same as display */}
      <View style={styles.measureWrapper} collapsable={false}>
        <View
          ref={contentRef}
          onLayout={handleContentLayout}
          style={[styles.measureContent, { width: A4_WIDTH }]}
        >
          <ResumeTemplate templateId={templateId} data={data} />
        </View>
      </View>

      {/* Paginated view */}
      {contentHeight > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const pageWidth = A4_WIDTH + PAGE_MARGIN * 2;
            const page = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
            if (page >= 0 && page < totalPages) {
              setCurrentPage(page);
            }
          }}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {Array.from({ length: totalPages }, (_, index) => {
            const pageStart = index * SAFE_PAGE_HEIGHT;
            
            return (
              <View key={index} style={[styles.pageContainer, { width: A4_WIDTH + PAGE_MARGIN * 2 }]}>
                <View style={[styles.page, { width: A4_WIDTH, height: A4_HEIGHT }]}>
                  <View 
                    style={[
                      styles.pageViewport, 
                      { 
                        height: SAFE_PAGE_HEIGHT, 
                        width: A4_WIDTH,
                      }
                    ]}
                  >
                    <View
                      style={[
                        styles.contentSlice,
                        {
                          width: A4_WIDTH,
                          height: contentHeight,
                          transform: [{ translateY: -pageStart }],
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
      )}

      {contentHeight === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {totalPages > 1 && contentHeight > 0 && (
        <View style={styles.pageIndicator}>
          <Text style={styles.pageIndicatorText}>
            {currentPage + 1} / {totalPages}
          </Text>
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
    top: -20000,
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
  pageViewport: {
    overflow: 'hidden',
    position: 'relative',
  },
  contentSlice: {
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
